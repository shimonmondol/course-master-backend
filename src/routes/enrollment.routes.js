const router = require("express").Router();
const enrollmentController = require("../controllers/enrollment.controller");
const authMiddleware = require("../middlewares/authMiddleware");

router.post("/:courseId", authMiddleware, enrollmentController.enrollCourse);

router.get("/my", authMiddleware, enrollmentController.myEnrollments);

router.patch(
  "/:enrollId/complete-lesson",
  authMiddleware,
  enrollmentController.completeLesson,
);

router.delete(
  "/:enrollId",
  authMiddleware,
  enrollmentController.removeEnrollment,
);

module.exports = router;