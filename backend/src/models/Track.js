import mongoose from 'mongoose';

const TrackSchema = new mongoose.Schema({
  title: { 
    type: String,
    required: true 
  },
  category: { 
    type: String, 
    enum: [
      'nature',
      'ambient-music',
      'binaural-beats',
      'white_noise',
      'asmr',
      'binaural',
      'ambient',
      'relaxation',
      'focus',
      'sleep',
    ], 
    default: 'nature' 
  },
  durationSec: { 
    type: Number, 
    default: 0 
  },
  storageUrl: { 
    type: String, 
    required: true 
  },
  tags: [String],
  isActive: { 
    type: Boolean, 
    default: true 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});
TrackSchema.index({ isActive: 1 });
TrackSchema.index({ category: 1 });
TrackSchema.index({ tags: 1 });
TrackSchema.index({ tags: 'text', title: 'text' });

export default mongoose.model('Track', TrackSchema);