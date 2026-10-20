
import mongoose from "mongoose";

const movieSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    description: {
      type: String,
      required: true,
    },
    genre: {
      type: [String],
      default: [],
    },
    duration: {
      type: Number,
      required: true,
      min: 1,
    },
    price: {
  type: Number,
  required: true,
  default: 220,
  min: 0,
},
    posterUrl: {
      type: String,
      default: "",
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 10,
    },
    releaseYear: {
      type: Number,
      default: new Date().getFullYear(),
    },
    language: {
      type: String,
      default: "English",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Movie", movieSchema);
