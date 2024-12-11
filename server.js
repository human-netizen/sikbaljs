import express from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import cors from "cors";
import mongoose from "mongoose";
import { ClassTest } from "./model/classtestModel.js";
import { Course } from "./model/courseModel.js";
import { Assignment } from "./model/assignmentModel.js";
// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();

// Middleware setup
app.use(cors());
app.use(express.json());
app.get("/", (req, res) => {
    res.json({ message: "Welcome to the JWT Authentication Server!" });
    }
);

// Protected Route - Requires Valid Access Token
app.get("/protected", authenticateToken, async (req, res) => {
  try {
    res.json({ message: "Welcome to the protected route!", user: req.user });
  } catch (error) {
    console.error("Error in /protected:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Get All Class Tests with Course Details
app.get("/class-tests", authenticateToken, async (req, res) => {
    try {
      const tests = await ClassTest.find().populate("courseId", "title credit");
      res.json(tests);
    } catch (error) {
      console.error("Error fetching class tests with course details:", error);
      res.status(500).json({ message: "Error fetching class tests", error });
    }
  });
  



  // MongoDB Connection
mongoose
.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
.then(() => console.log("Connected to MongoDB Atlas"))
.catch((err) => console.error("MongoDB Atlas connection error:", err));

// app.get("/class-test",authenticateToken, async (req,res){
//   // you will get all this out of the box
//   // user = req.user; 
//   // user.role
//   // user.email
//   // user.uid
//   // user.name
// })


// Middleware to Check if Role is 'Teacher'
function authorizeTeacher(req, res, next) {
    const user = req.user;
  
    // Ensure the user has a role and it is 'teacher'
    if (user && user.role === "teacher") {
      return next(); // Proceed to the next middleware or route handler
    }
  
    return res.status(403).json({ message: "Access denied. Only teachers can perform this operation." });
  }



// Middleware to Authenticate Access Token
function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) return res.status(401).json({ message: "Token required" });
  console.log("Token:", token);

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    // if (err) return res.status(403).json({ message: "Invalid token" });
    if (err) {
      if (err.name === "TokenExpiredError") {
        // Token has expired
        return res.status(401).json({
          tokenExpired: true,
          message: "Token expired",
          expiredAt: err.expiredAt, // Optionally send the expiry time
        });
      } else {
        // Other token verification errors
        console.log(process.env.ACCESS_TOKEN_SECRET);
        return res.status(403).json({ message: "Invalid token" });
      }
    }

    req.user = user;
    next();
  });
}

//Course 

// Create a Course
app.post("/courses", authenticateToken, authorizeTeacher, async (req, res) => {
    try {
      const course = new Course(req.body);
      const savedCourse = await course.save();
      res.status(201).json(savedCourse);
    } catch (error) {
      console.error("Error creating course:", error);
      res.status(400).json({ message: "Error creating course", error });
    }
  });
  
  // Get All Courses
  app.get("/courses", authenticateToken, async (req, res) => {
    try {
      const courses = await Course.find();
      res.json(courses);
    } catch (error) {
      console.error("Error fetching courses:", error);
      res.status(500).json({ message: "Error fetching courses", error });
    }
  });
  
  // Update a Course
  app.put("/courses/:id", authenticateToken, authorizeTeacher, async (req, res) => {
    try {
      const updatedCourse = await Course.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
      });
      if (!updatedCourse) return res.status(404).json({ message: "Course not found" });
      res.json(updatedCourse);
    } catch (error) {
      console.error("Error updating course:", error);
      res.status(400).json({ message: "Error updating course", error });
    }
  });
  
  // Delete a Course
  app.delete("/courses/:id", authenticateToken, authorizeTeacher, async (req, res) => {
    try {
      const deletedCourse = await Course.findByIdAndDelete(req.params.id);
      if (!deletedCourse) return res.status(404).json({ message: "Course not found" });
      res.json({ message: "Course deleted successfully", deletedCourse });
    } catch (error) {
      console.error("Error deleting course:", error);
      res.status(500).json({ message: "Error deleting course", error });
    }
  });
//Class Test
// Create a Class Test
app.post("/class-tests", authenticateToken, authorizeTeacher, async (req, res) => {
    try {
      const classTest = new ClassTest(req.body);
      const savedTest = await classTest.save();
      res.status(201).json(savedTest);
    } catch (error) {
      console.error("Error creating class test:", error);
      res.status(400).json({ message: "Error creating class test", error });
    }
  });
  
  // Get Class Tests for a Course
  app.get("/class-tests/:courseId", authenticateToken, async (req, res) => {
    try {
      const tests = await ClassTest.find({ courseId: req.params.courseId });
      res.json(tests);
    } catch (error) {
      console.error("Error fetching class tests:", error);
      res.status(500).json({ message: "Error fetching class tests", error });
    }
  });
//Assignment
// Create an Assignment
app.post("/assignments", authenticateToken, authorizeTeacher, async (req, res) => {
    try {
      const assignment = new Assignment(req.body);
      const savedAssignment = await assignment.save();
      res.status(201).json(savedAssignment);
    } catch (error) {
      console.error("Error creating assignment:", error);
      res.status(400).json({ message: "Error creating assignment", error });
    }
  });
  
  // Get Assignments for a Course
  app.get("/assignments/:courseId", authenticateToken, async (req, res) => {
    try {
      const assignments = await Assignment.find({ courseId: req.params.courseId });
      res.json(assignments);
    } catch (error) {
      console.error("Error fetching assignments:", error);
      res.status(500).json({ message: "Error fetching assignments", error });
    }
  });
  



const PORT = process.env.PORT || 4000;
app.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`)
);
//mongodb+srv://<db_username>:<db_password>@cluster0.ivqhx.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0