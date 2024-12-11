import mongoose from "mongoose";

const assignmentSchema = new mongoose.Schema({
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
    title: { type: String, required: true },
    dueDate: { type: Date, required: true },
    totalMarks: { type: Number, required: true },
    description: { type: String },
  });
  
  export const Assignment = mongoose.model("Assignment", assignmentSchema);