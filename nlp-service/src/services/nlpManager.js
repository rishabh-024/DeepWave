import nlp from 'node-nlp';
const { NlpManager } = nlp;

const manager = new NlpManager({ languages: ['en'], forceNER: true });

// await manager.load('./model/emotion-v1.nlp'); // Model file is empty, skipping load

// Add some basic training data for emotions
manager.addDocument('en', 'I feel happy', 'happy');
manager.addDocument('en', 'I am sad', 'sad');
manager.addDocument('en', 'I am stressed', 'stressed');
manager.addDocument('en', 'I feel calm', 'calm');

await manager.train();

export const analyzeText = async (text) => {
  const result = await manager.process('en', text);
  return {
    intent: result.intent,
    confidence: result.score,
    answer: result.answer || null,
  };
};
