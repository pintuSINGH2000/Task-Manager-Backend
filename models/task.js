const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema(
  {
    taskName: {
      type: String,
      required: true,
      trim: true,
    },
    priority: {
      type: Number,
      enum: [1, 2, 3], // 1-> low priority 2-> moderate priority 3-> high priority
      required: true,
    },
    checkList: [
      {
        Listitem: {
          type: String,
          required: true,
          trim: true,
        },
        checked: {
          type: Boolean,
          default: false,
        },
      },
    ],
    dueDate: {
      type: Date,
      default: null,
    },
    checkCount:{
       type: Number,
       default:0
    },
    progress:{
      type: Number,
      enum: [1, 2, 3, 4], // 1-> backlog 2-> todo 3-> inprogress 4->done
      default: 2
    },
    assignedTo:{
      type: String,
      trim:true,
    },
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },

  { timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" } }
);

module.exports = mongoose.model("Task", taskSchema);
