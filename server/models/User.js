const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      trim: true
    },

    lastName: {
      type: String,
      required: true,
      trim: true
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },

    password: {
      type: String,
      required: true
    },

    accountStatus: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active'
    },

    accountType: {
      type: String,
      enum: ['standard', 'admin'],
      default: 'standard'
    }
  },
  {
    timestamps: true // 👈 IMPORTANT
  }
);

module.exports = mongoose.model('User', UserSchema);
