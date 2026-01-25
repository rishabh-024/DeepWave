import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    name: { type: String },
    email: { type: String, required: true, unique: true, index: true },
    passwordHash: { type: String, required: true },
    isAdmin: { type: Boolean, default: false },
    preferences: { type: mongoose.Schema.Types.Mixed, default: {} },
    createdAt: { type: Date, default: Date.now },
    role: { 
      type: String, 
      enum: ['user', 'admin'], 
      default: 'user'
    }
  },
  { timestamps: true }
);

const User = mongoose.model('User', userSchema);
export default User;