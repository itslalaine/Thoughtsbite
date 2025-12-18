const mongoose = require('mongoose');

const Schema = mongoose.Schema;
  const UserSchema = new Schema({

    firstName: {
    type: String,
    required: true,
    },
    lastName: {
    type: String,
    required: true,
    }, 
    email: {
    type: String,
    required: true,
    unique: true,
    },
    password: {
    type: String,
    required: true,
    },
    accountStatus: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active',
    },
    accountType: {
    type: String,
    enum: ['standard', 'admin'],
    default: 'admin',
    },
    createDate: {
    type: Date,
    default: Date.now,
    },
    updatedDate: {
    type: Date,
    default: Date.now,
    }
});

module.exports = mongoose.model('User', UserSchema);
// module.exports = User;

//1:04 
