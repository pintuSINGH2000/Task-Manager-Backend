const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim:true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim:true,
    },
    password: {
      type: String,
      require: true,
      trim:true,
    },
    member: [{
      memberEmail: {
        type: String,
        required: true,
        trim: true,
      }
    }],
  },
  { timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" } }
);

module.exports = mongoose.model("User", userSchema);
