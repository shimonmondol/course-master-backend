const mongoose = require("mongoose");
const Enrollment = require("../models/Enrollment");
const Course = require("../models/Course");

const enrollCourse = async (studentId, courseId, batchId = null) => {
  const course = await Course.findById(courseId);
  if (!course) {
    throw new Error("Course not found");
  }

  // ইউজার আগে থেকেই এনরোল্ড কি না তা চেক করা
  const existingEnrollment = await Enrollment.findOne({
    student: studentId,
    course: courseId,
  });

  if (existingEnrollment) {
    throw new Error("Already enrolled in this course");
  }

  // validBatchId সঠিকভাবে ডিফাইন ও ভ্যালিডেট করা
  const validBatchId =
    batchId && mongoose.Types.ObjectId.isValid(batchId) ? batchId : null;

  // নতুন এনরোলমেন্ট তৈরি
  const enrollment = await Enrollment.create({
    student: studentId,
    course: courseId,
    batchId: validBatchId,
    progress: { completedLessons: [], percent: 0 },
  });

  return enrollment;
};

const getMyEnrollments = async (studentId) => {
  return Enrollment.find({ student: studentId })
    .populate("course", "title instructorName price category tags syllabus")
    .sort({ createdAt: -1 });
};

const completeLesson = async (enrollId, lessonId) => {
  const enrollment = await Enrollment.findById(enrollId);
  if (!enrollment) {
    throw new Error("Enrollment not found");
  }

  // ডুপ্লিকেট লেসন কমপ্লিশন রোধ
  const alreadyDone = enrollment.progress.completedLessons
    .map(String)
    .includes(String(lessonId));

  if (!alreadyDone) {
    enrollment.progress.completedLessons.push(lessonId);
  }

  // সিলেবাসের মোট লেসন সংখ্যা নিরাপদভাবে গণনা
  const course = await Course.findById(enrollment.course);
  const totalLessons =
    course?.syllabus?.reduce(
      (sum, mod) => sum + (mod.lessons ? mod.lessons.length : 0),
      0
    ) || 0;

  const completed = enrollment.progress.completedLessons.length;
  enrollment.progress.percent =
    totalLessons === 0 ? 0 : Math.round((completed / totalLessons) * 100);

  // ডাটাবেসে সেভ নিশ্চিত করতে await
  await enrollment.save();
  return enrollment;
};

// কোর্স এনরোলমেন্ট রিমুভ করার ফাংশন
const removeEnrollment = async (studentId, enrollId) => {
  if (!mongoose.Types.ObjectId.isValid(enrollId)) {
    throw new Error("Invalid Enrollment ID");
  }

  // স্টুডেন্টের ওন করা এনরোলমেন্ট ডাটা ডিলিট করা
  const deletedEnrollment = await Enrollment.findOneAndDelete({
    _id: enrollId,
    student: studentId,
  });

  if (!deletedEnrollment) {
    throw new Error("Enrollment not found or unauthorized");
  }

  return { message: "Course removed successfully", enrollmentId: enrollId };
};

module.exports = {
  enrollCourse,
  getMyEnrollments,
  completeLesson,
  removeEnrollment,
};