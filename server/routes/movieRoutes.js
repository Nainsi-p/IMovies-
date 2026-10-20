
import express from "express";
import mongoose from "mongoose";
import Movie from "../models/Movie.js";

const router = express.Router();

// GET /api/movies — list and search movies
router.get("/", async (req, res) => {
  try {
    const { search, genre } = req.query;
    const filter = { isActive: true };

    if (search && search.trim()) {
      filter.title = {
        $regex: search.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
        $options: "i",
      };
    }

    if (genre && genre.trim() && genre.toLowerCase() !== "all") {
      filter.genre = {
        $regex: `^${genre.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`,
        $options: "i",
      };
    }

    const movies = await Movie.find(filter).sort({ title: 1 });

    res.json({
      success: true,
      count: movies.length,
      movies,
    });
  } catch (error) {
    console.error("Fetch movies error:", error.message);
    res.status(500).json({
      success: false,
      message: "Could not fetch movies.",
    });
  }
});

// GET /api/movies/:id — movie details
router.get("/:id", async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid movie ID.",
      });
    }

    const movie = await Movie.findOne({
      _id: req.params.id,
      isActive: true,
    });

    if (!movie) {
      return res.status(404).json({
        success: false,
        message: "Movie not found.",
      });
    }

    res.json({ success: true, movie });
  } catch (error) {
    console.error("Fetch movie error:", error.message);
    res.status(500).json({
      success: false,
      message: "Could not fetch movie details.",
    });
  }
});

export default router;
