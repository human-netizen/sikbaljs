import mongoose from "mongoose";

const classTestSchema = new mongoose.Schema({
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
    syllabus: { type: String, required: true },
    dateOfTest: { type: Date, required: true },
    roomNumber: { type: String, required: true },
    totalMarks: { type: Number, required: true },
  });
  
export const ClassTest = mongoose.model("ClassTest", classTestSchema);
  