const validateTask = (req, res, next) => {
  try {
    const taskData = req.body;
    // Check for missing required fields
    if (
      !taskData ||
      !taskData.taskName ||
      taskData.taskName.trim().length === 0
    ) {
      return res.status(400).send({ errorMessage: "Bad request" });
    }
    // Validate priority
    if (!taskData.priority || ![1, 2, 3].includes(taskData.priority)) {
      return res.status(400).send({ errorMessage: "Bad request" });
    }
    // Validate chekList
    if (
      !taskData.checkList ||
      !Array.isArray(taskData.checkList) ||
      taskData.checkList.length === 0
    ) {
      return res.status(400).send({ errorMessage: "Bad request" });
    }

    for (let cIndex = 0; cIndex < taskData.checkList.length; cIndex++) {
      let list = taskData.checkList[cIndex];
      if (!list.Listitem || list.Listitem.trim().length === 0) {
        return res.status(400).send({ errorMessage: "Bad request" });
      }
      if (typeof list.checked !== "boolean") {
        return res.status(400).send({ errorMessage: "Bad request" });
      }
    }
    if (
      taskData.checkCount === undefined ||
      taskData.checkCount === null ||
      taskData.checkList.length < taskData.checkCount ||
      taskData.checkCount < 0
    ) {
      return res.status(400).send({ errorMessage: "Bad request" });
    }
    if (taskData.dueDate) {
      if (!isDate(taskData.dueDate)) {
        return res.status(400).send({ errorMessage: "Bad request" });
      }
    }
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    if (
      taskData.assignedTo &&
      (taskData.assignedTo.trim().length === 0 ||
        !emailRegex.test(taskData.assignedTo.trim()))
    ) {
      return res.status(400).send({ errorMessage: "Bad request" });
    }
    next();
  } catch (error) {
    return res.status(500).send({ errorMessage: "Internal server error" });
  }
};

function isDate(value) {
  if (Object.prototype.toString.call(value) === "[object Date]") {
    return !isNaN(value);
  } else if (typeof value === "string") {
    const parsedDate = new Date(value);
    return !isNaN(parsedDate);
  }
  return false;
}

module.exports = {
  validateTask,
};
