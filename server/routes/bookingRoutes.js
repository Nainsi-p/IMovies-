
import express from "express";
import mongoose from "mongoose";
import Booking from "../models/Booking.js";
import Movie from "../models/Movie.js";
import auth from "../middleware/auth.js";

const router = express.Router();

const ROWS = ["A", "B", "C", "D", "E", "F"];
const SEATS_PER_ROW = 8;
const VALID_SHOWTIMES = ["10:00 AM", "1:00 PM", "4:00 PM", "7:00 PM"];

function getValidSeat(seat) {
  return typeof seat === "string" && /^[A-F][1-8]$/.test(seat);
}

function isValidDate(dateString) {
  if (typeof dateString !== "string") return false;

  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateString);
  if (!match) return false;

  const [, year, month, day] = match;
  const date = new Date(
    Date.UTC(Number(year), Number(month) - 1, Number(day))
  );

  return (
    date.getUTCFullYear() === Number(year) &&
    date.getUTCMonth() === Number(month) - 1 &&
    date.getUTCDate() === Number(day)
  );
}

// GET /api/bookings/availability
// Seat availability can be viewed without logging in.
router.get("/availability", async (req, res) => {
  try {
    const { movieId, showDate, showtime } = req.query;

    if (
      !movieId ||
      !mongoose.isValidObjectId(movieId) ||
      !isValidDate(showDate) ||
      !VALID_SHOWTIMES.includes(showtime)
    ) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid movie, date and showtime.",
      });
    }

    const bookings = await Booking.find({
      movieId,
      showDate,
      showtime,
      status: "confirmed",
    }).select("seats");

    const bookedSeats = [
      ...new Set(bookings.flatMap((booking) => booking.seats)),
    ];

    return res.json({ success: true, bookedSeats });
  } catch (error) {
    console.error("Seat availability error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to retrieve seat availability.",
    });
  }
});

router.get("/my", auth, async (req, res) => {
  try {
    const bookings = await Booking.find({
      userId: req.user.id,
    }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: bookings.length,
      bookings,
    });
  } catch (error) {
    console.error("Error fetching user bookings:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch your bookings.",
    });
  }
});


// POST /api/bookings
// A valid JWT is required to create a booking.
router.post("/", auth, async (req, res) => {
  try {
    const { movieId, showDate, showtime, seats } = req.body;

    if (
      !movieId ||
      !mongoose.isValidObjectId(movieId) ||
      !isValidDate(showDate) ||
      !VALID_SHOWTIMES.includes(showtime) ||
      !Array.isArray(seats) ||
      seats.length === 0 ||
      seats.length > ROWS.length * SEATS_PER_ROW ||
      !seats.every(getValidSeat) ||
      new Set(seats).size !== seats.length
    ) {
      return res.status(400).json({
        success: false,
        message: "Please provide valid booking details.",
      });
    }

    const movie = await Movie.findById(movieId);

    if (!movie || movie.isActive === false) {
      return res.status(404).json({
        success: false,
        message: "Movie not found or unavailable.",
      });
    }

    const ticketPrice = Number(movie.ticketPrice ?? movie.price);

    if (!Number.isFinite(ticketPrice) || ticketPrice < 0) {
      return res.status(500).json({
        success: false,
        message: "A valid ticket price is not configured for this movie.",
      });
    }

    // Reject seats that have already been confirmed as booked.
    const existingBookings = await Booking.find({
      movieId,
      showDate,
      showtime,
      status: "confirmed",
      seats: { $in: seats },
    }).select("seats");

    const unavailableSeats = [
      ...new Set(
        existingBookings.flatMap((booking) =>
          booking.seats.filter((seat) => seats.includes(seat))
        )
      ),
    ];

    if (unavailableSeats.length > 0) {
      return res.status(409).json({
        success: false,
        message: "Some seats are no longer available.",
        unavailableSeats,
      });
    }

    const booking = await Booking.create({
      userId: req.user.id,
      movieId,
      movieTitle: movie.title,
      showDate,
      showtime,
      seats,
      ticketPrice,
      totalAmount: seats.length * ticketPrice,
      status: "confirmed",
    });

    return res.status(201).json({
      success: true,
      message: "Booking created successfully.",
      booking,
    });
  } catch (error) {
    console.error("Create booking error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to create your booking.",
    });
  }
});

export default router;
