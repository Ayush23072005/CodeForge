const mongoose = require('mongoose');

const executionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null, // Null for anonymous executions
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
    input: {
      type: String,
      default: '',
    },
    output: {
      type: String,
      default: '',
    },
    error: {
      type: String,
      default: '',
    },
    executionTime: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ['success', 'error', 'timeout'],
      default: 'success',
    },
  },
  {
    timestamps: true,
  }
);

// Auto-delete after 30 days
executionSchema.index({ createdAt: 1 }, { expireAfterSeconds: 30 * 24 * 60 * 60 });

module.exports = mongoose.model('Execution', executionSchema);
