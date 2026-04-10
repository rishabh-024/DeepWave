import mongoose from 'mongoose';

const TrackSchema = new mongoose.Schema({
  title: { 
    type: String,
    required: true 
  },
  artist: {
    type: String,
    default: 'DeepWave'
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
  cover: {
    type: String,
    default: ''
  },
  description: {
    type: String,
    default: ''
  },
  gridFsId: {
    type: mongoose.Schema.Types.ObjectId,
    default: null
  },
  coverGridFsId: {
    type: mongoose.Schema.Types.ObjectId,
    default: null
  },
  source: {
    type: String,
    default: 'DeepWave'
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
