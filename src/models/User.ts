import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const UserSchema = new mongoose.Schema({
  name: { type: String },
  email: { type: String, required: true, unique: true },
  password: { type: String },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  createdAt: { type: Date, default: Date.now },
});

// Hash password before saving
UserSchema.pre('save', function (next) {
  if (!this.isModified('password')) return next();
  bcrypt.hash(this.password as string, 10)
    .then((hash: string) => {
      this.password = hash;
      next();
    })
    .catch((err: any) => {
      next(err);
    });
});

export default mongoose.models.User || mongoose.model('User', UserSchema);
