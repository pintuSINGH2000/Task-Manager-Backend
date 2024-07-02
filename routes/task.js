const express = require("express");
const { createTask, getAllTask, updateProgressAndCheckListTask, addMember, getMember, updateTask, deleteTask, getTaskAnalytic, getSingleTask } = require("../controllers/task");
const { validateTask } = require("../Middleware/validateTask");
const { verifyToken } = require("../Middleware/verifyToken");
const router = express.Router();

router.post("/create-task",verifyToken,validateTask,createTask);
router.get("/get-task",verifyToken,getAllTask);
router.post("/update-checklist-progress-task",verifyToken,updateProgressAndCheckListTask);
router.post("/add-member",verifyToken,addMember);
router.get("/get-member",verifyToken,getMember);
router.post("/update-task/:id",verifyToken,validateTask,updateTask);
router.delete("/delete-task/:id", verifyToken, deleteTask);
router.get("/analytic-task", verifyToken, getTaskAnalytic);
router.get("/get-single-task/:id", getSingleTask);

module.exports = router;