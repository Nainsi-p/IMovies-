
import dotenv from "dotenv";
import mongoose from "mongoose";
import Movie from "./models/Movie.js";

dotenv.config();

const movies = [
  {
    title: "Interstellar",
    description:
      "A team of explorers travels beyond this galaxy to discover whether mankind has a future among the stars.",
    genre: ["Sci-Fi", "Adventure", "Drama"],
    duration: 169,
    price: 220,
    rating: 8.7,
    releaseYear: 2014,
    posterUrl: "",
  },
  {
    title: "The Dark Knight",
    description:
      "Batman faces a criminal mastermind who pushes Gotham into chaos.",
    genre: ["Action", "Crime", "Drama"],
    duration: 152,
    price: 220,
    rating: 9.0,
    releaseYear: 2008,
    posterUrl: "",
  },
  {
    title: "Inception",
    description:
      "A skilled thief enters people's dreams to steal secrets and attempt an unusual mission.",
    genre: ["Sci-Fi", "Action", "Thriller"],
    duration: 148,
    price: 220,
    rating: 8.8,
    releaseYear: 2010,
    posterUrl: "",
  },
  {
    title: "Dune",
    description:
      "A young heir travels to a dangerous desert planet tied to his family's future.",
    genre: ["Sci-Fi", "Adventure", "Drama"],
    duration: 155,
    price: 220,
    rating: 8.0,
    releaseYear: 2021,
    posterUrl: "",
  },
];

async function seedMovies() {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error("MONGODB_URI is missing from server/.env");
    }

    await mongoose.connect(process.env.MONGODB_URI);

    for (const movie of movies) {
      const { price, ...movieDetails } = movie;

      await Movie.updateOne(
        { title: movie.title },
        {
          $set: { price },
          $setOnInsert: movieDetails,
        },
        { upsert: true }
      );
    }

    console.log("All four movies now have ticket prices.");
  } catch (error) {
    console.error("Movie seeding failed:", error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

seedMovies();
