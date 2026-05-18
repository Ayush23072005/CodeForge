const mongoose = require('mongoose');

const snippetSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: [true, 'Snippet title is required'],
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    language: {
      type: String,
      required: true,
      enum: ['python', 'cpp', 'java'],
    },
    code: {
      type: String,
      required: true,
    },
    shareId: {
      type: String,
      unique: true,
      sparse: true,
    },
    isPublic: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Snippet', snippetSchema);
