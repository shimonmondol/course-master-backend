const enrollmentService = require("../services/enrollment.service");

const enrollCourse = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;
    if (!userId) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    const courseId = req.params.courseId || req.body.courseId;
    const batchId = req.body.batchId;

    const enrollment = await enrollmentService.enrollCourse(
      userId,
      courseId,
      batchId
    );

    return res.status(201).json(enrollment);
  } catch (err) {
    console.error("🔥 ENROLLMENT ERROR DETAILS:", err);
    return res.status(400).json({ message: err.message });
  }
};

const myEnrollments = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;
    if (!userId) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    const data = await enrollmentService.getMyEnrollments(userId);
    return res.json(data);
  } catch (err) {
    return res.status(400).json({ message: err.message });
  }
};

const completeLesson = async (req, res) => {
  try {
    const enrollId = req.params.enrollId || req.body.enrollId;
    const lessonId = req.body.lessonId;

    if (!enrollId || !lessonId) {
      return res
        .status(400)
        .json({ message: "Enrollment ID and Lesson ID are required" });
    }

    const data = await enrollmentService.completeLesson(enrollId, lessonId);
    return res.json(data);
  } catch (err) {
    return res.status(400).json({ message: err.message });
  }
};

// কোর্স এনরোলমেন্ট রিমুভ করার কন্ট্রোলার মেথড
const removeEnrollment = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;
    if (!userId) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    const enrollId = req.params.enrollId || req.body.enrollId;
    if (!enrollId) {
      return res.status(400).json({ message: "Enrollment ID is required" });
    }

    const result = await enrollmentService.removeEnrollment(userId, enrollId);
    return res.json(result);
  } catch (err) {
    return res.status(400).json({ message: err.message });
  }
};

module.exports = {
  enrollCourse,
  myEnrollments,
  completeLesson,
  removeEnrollment,
};