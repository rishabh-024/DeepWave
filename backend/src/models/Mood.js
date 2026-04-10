import mongoose from 'mongoose';

const MoodSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  mood: {
    type: String,
    required: true,
    enum: ['happy', 'calm', 'stressed', 'angry', 'sad', 'anxious', 'neutral'],
  },
  notes: {
    type: String,
    maxlength: 500,
    default: '',
  },
  intensity: {
    type: Number,
    min: 1,
    max: 10,
    default: 5,
  },
}, {
  timestamps: true
});

MoodSchema.index({ user: 1, createdAt: -1 });

const Mood = mongoose.model('Mood', MoodSchema);

export default Mood;