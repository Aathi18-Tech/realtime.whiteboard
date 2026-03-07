import mongoose from "mongoose";

const boardElementSchema = new mongoose.Schema(
  {
    type: String,
    x: Number,
    y: Number,
    x1: Number,
    y1: Number,
    x2: Number,
    y2: Number,
    width: Number,
    height: Number,
    cx: Number,
    cy: Number,
    radius: Number,
    text: String,
    color: String,
    brushSize: Number,
    points: [{ x: Number, y: Number }]
  },
  { _id: false }
);

const boardVersionSchema = new mongoose.Schema(
  {
    elements: [boardElementSchema],
    savedAt: {
      type: Date,
      default: Date.now
    }
  },
  { _id: false }
);

const boardSchema = new mongoose.Schema(
  {
    roomId: {
      type: String,
      required: true,
      unique: true
    },
    elements: [boardElementSchema],
    versions: [boardVersionSchema]
  },
  { timestamps: true }
);

export default mongoose.model("Board", boardSchema);