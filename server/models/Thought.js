const mongoose = require('mongoose');

const ThoughtSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },

    content: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000
    },

    sourceType: {
      type: String,
      trim: true
    },

    sourceLink: {
      type: String,
      trim: true
    },
    
    sourceTitle: {
      type: String,
      trim: true
    },

    theme: {
      type: String,
      trim: true
    },

    mood: {
      type: String,
      enum: ['motivated', 'neutral', 'confused', 'inspired', 'overwhelmed'],
      default: 'neutral'
    },
    // impact: {
    //   type: String,
    //   enum: ['low', 'medium', 'high'],
    //   default: 'medium'
    // },
    dateWatched: {
      type: Date
    },
    isDeleted: {
      type: Boolean,
      default: false
    },

    deletedAt: {
      type: Date,
      default: null
    },
    deletedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
    },
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Thought', ThoughtSchema);
