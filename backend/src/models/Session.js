import mongoose from 'mongoose';

const SessionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  track: { type: mongoose.Schema.Types.ObjectId, ref: 'Track', required: true },
  preMood: { type: mongoose.Schema.Types.Mixed, default: {} },
  postMood: { type: mongoose.Schema.Types.Mixed, default: {} },
  startedAt: { type: Date, default: Date.now },
  endedAt: { type: Date },
  completionPct: { type: Number, default: 0 }
});

export default mongoose.model('Session', SessionSchema);