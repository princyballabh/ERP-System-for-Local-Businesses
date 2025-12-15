import mongoose, { Schema, model, models } from "mongoose";

const CategorySchema = new Schema({
  name: { type: String, required: true, unique: true },
});

export default models.Category || mongoose.model('Category', CategorySchema);
