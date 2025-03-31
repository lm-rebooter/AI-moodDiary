import mongoose, { Schema, Document } from 'mongoose';

export interface IMood extends Document {
  userId: string;
  type: string;
  content: string;
  emotion: string;
  value: number;
  createdAt: Date;
  updatedAt: Date;
}

const MoodSchema = new Schema({
  userId: { type: String, required: true },
  type: { type: String, required: true },
  content: { type: String, required: true },
  emotion: { type: String, required: true },
  value: { type: Number, required: true, min: 0, max: 100 },
}, {
  timestamps: true
});

export const MoodModel = mongoose.model<IMood>('Mood', MoodSchema); 