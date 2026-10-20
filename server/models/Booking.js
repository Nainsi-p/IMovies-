
import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    movieId: {
      type: String,
      required: true,
      index: true,
    },
    movieTitle: {
      type: String,
      required: true,
      trim: true,
    },
    showDate: {
      type: String,
      required: true,
    },
    showtime: {
      type: String,
      required: true,
    },
    seats: {
      type: [String],
      required: true,
      validate: {
        validator: (seats) =>
          Array.isArray(seats) &&
          seats.length > 0 &&
          new Set(seats).size === seats.length,
        message: "Select at least one unique seat.",
      },
    },
    ticketPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: ["pending", "confirmed", "cancelled"],
      default: "pending",
    },
  },
  { timestamps: true }
);


export default mongoose.model("Booking", bookingSchema);
