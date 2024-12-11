import mongoose from "mongoose";

// Course Schema
const courseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  credit: { type: Number, required: true },
  courseCode: { type: String, required: true, unique: true }, // New field for course code
});

export const Course = mongoose.model("Course", courseSchema);
