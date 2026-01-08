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
    }
  },
  
  {
    timestamps: true // 👈 IMPORTANT
  }
);

module.exports = mongoose.model('User', UserSchema);
