const mongoose = require("mongoose");
const Task = require("../models/task");
const User = require("../models/user");

const createTask = async (req, res) => {
  try {
    const taskData = req.body;
    const creator = req.creator;

    if (taskData.assignedTo) {
      const user = await User.findById(creator);
      const isMemberExist = user.member.some(
        (member) => member.memberEmail === taskData.assignedTo
      );
      if (!isMemberExist) {
        return res.status(400).send({ errorMessage: "Bad request" });
      }
    }

    const task = new Task({
      ...taskData,
      creator,
    });
    await task.save();
    res.status(201).send({ task: task, message: "Task created Successfully" });
  } catch (error) {
    return res.status(500).send({ errorMessage: "Internal server error" });
  }
};

const updateTask = async (req, res) => {
  try {
    const taskData = req.body;
    const taskId = req.params.id;
    const creator = req.creator;

    if (taskData.assignedTo) {
      const user = await User.findById(creator);
      const isMemberExist = user.member.some(
        (member) => member.memberEmail === taskData.assignedTo
      );
      if (!isMemberExist) {
        return res.status(400).send({ errorMessage: "Bad request" });
      }
    }
    const updatedQuestion = await Task.findByIdAndUpdate(
      taskId,
      { $set: taskData },
      { new: true, runValidators: true }
    );
    if (!updatedQuestion) {
      return res.status(400).send({ errorMessage: "Bad request" });
    }
    res
      .status(201)
      .send({ task: updatedQuestion, message: "Task Updated Successfully" });
  } catch (error) {
    return res.status(500).send({ errorMessage: "Internal server error" });
  }
};

const getAllTask = async (req, res) => {
  try {
    const filter = req.query.filter;
    const creatorId = req.creator;
    let filterday = new Date();

    if (filter == 1) {
      filterday.setHours(0, 0, 0, 0);
    } else if (filter == 2) {
      filterday.setDate(filterday.getDate() - 7);
      filterday.setHours(0, 0, 0, 0);
    } else if (filter == 3) {
      filterday.setDate(filterday.getDate() - 30);
      filterday.setHours(0, 0, 0, 0);
    } else {
      return res.status(400).send({ errorMessage: "Bad request" });
    }

    const user = await User.findById(creatorId).select("email");
    const tasks = await Task.find({
      createdAt: { $gte: filterday },
      $or: [{ creator: creatorId }, { assignedTo: user?.email }],
    });
    res.status(200).send({ tasks });
  } catch (error) {
    return res.status(500).send({ errorMessage: "Internal server error" });
  }
};

const updateProgressAndCheckListTask = async (req, res) => {
  try {
    const { taskId, checkListId, checked, progress, isProgress } = req.body;
    const creatorId = req.creator;
    if (
      !taskId ||
      (isProgress && (!progress || ![1, 2, 3, 4].includes(progress))) ||
      (!isProgress && (!checkListId || typeof checked !== "boolean"))
    ) {
      return res.status(400).send({ errorMessage: "Bad request" });
    }
    const user = await User.findById(creatorId).select("email");
    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ errorMessage: "Task not found" });
    }

    if (
      task.creator.toString() === creatorId ||
      task.assignedTo === user?.email
    ) {
      const update = {};
      const option = {
        new: true,
        runValidators: true,
      };
      if (isProgress) {
        update["progress"] = progress;
      } else {
        update["checkList.$[item].checked"] = checked;
        update["checkCount"] = task.checkCount + (checked ? 1 : -1);
        option["arrayFilters"] = [{ "item._id": checkListId }];
      }
      const updatedTask = await Task.findByIdAndUpdate(
        taskId,
        { $set: update },
        option
      );
      return res
        .status(200)
        .json({ message: "Task updated successfully", task: true });
    } else {
      return res
        .status(403)
        .json({ errorMessage: "Unauthorized to update this task" });
    }
  } catch (error) {
    return res.status(500).send({ errorMessage: "Internal server error" });
  }
};

const addMember = async (req, res) => {
  try {
    const { email } = req.body;
    const creatorId = req.creator;
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!email || !emailRegex.test(email)) {
      return res.status(400).json({ errorMessage: "Bad Request" });
    }
    const user = await User.findById(creatorId);
    if (user?.email == email) {
      return res
        .status(400)
        .send({ errorMessage: "You cannot add your email" });
    }
    const memberExists = user.member.some(
      (member) => member.memberEmail === email
    );
    if (memberExists) {
      return res.status(400).json({ errorMessage: "Member already exists" });
    }

    user.member.push({ memberEmail: email });
    await user.save();

    return res
      .status(200)
      .json({ message: "Member added successfully", user: true });
  } catch (error) {
    return res.status(500).send({ errorMessage: "Internal server error" });
  }
};

const getMember = async (req, res) => {
  try {
    const skip = req.query.skip;
    const creatorId = req.creator;
    const users = await User.findById(creatorId, {
      member: { $slice: [parseInt(skip), 5] },
    });
    return res.status(200).json({ members: users.member });
  } catch (error) {
    return res.status(500).send({ errorMessage: "Internal server error" });
  }
};

const deleteTask = async (req, res) => {
  try {
    const taskId = req.params.id;
    const creator = req.creator;
    const deletedTask = await Task.findOneAndDelete({
      _id: taskId,
      creator: creator,
    });
    if (!deletedTask) {
      return res.status(404).send({ errorMessage: "Bad Request" });
    }
    return res
      .status(200)
      .send({ deleted: true, message: "Task deleted Successfully" });
  } catch (error) {
    return res.status(500).json({ errorMessage: "Internal Server Error" });
  }
};

const getTaskAnalytic = async (req, res) => {
  try {
    const creatorId = req.creator;
    const user = await User.findById(creatorId).select("email");
    const tasks = await Task.find({
      $or: [{ creator: creatorId }, { assignedId: user }],
    }).select("progress priority dueDate");
    res.status(200).send({ tasks });
  } catch (error) {
    return res.status(500).send({ errorMessage: "Internal server error" });
  }
};

const getSingleTask = async (req, res) => {
  const id = req.params.id;
  try {
    const task = await Task.findById(id).select(
      "taskName priority checkList dueDate checkCount"
    );
    res.status(201).send({ task });
  } catch (error) {
    return res.status(500).send({ errorMessage: "Internal server error" });
  }
};

module.exports = {
  createTask,
  getAllTask,
  updateProgressAndCheckListTask,
  addMember,
  getMember,
  updateTask,
  deleteTask,
  getTaskAnalytic,
  getSingleTask,
};
