import mongoose, { Schema, Document } from 'mongoose';

interface QuestionAnswer {
  question: string;
  answer: string;
}

interface Session extends Document {
  sessionId: string;
  currentQuestion: number;
  startTime: Date;
  endTime?: Date;
  questions: QuestionAnswer[];
}

const SessionSchema: Schema = new Schema({
  sessionId: { type: String, required: true, unique: true },
  currentQuestion: { type: Number, default: 0 },
  startTime: { type: Date, default: Date.now },
  endTime: { type: Date },
  questions: [
    {
      question: { type: String, required: true },
      answer: { type: String },
    },
  ],
});

export default mongoose.model<Session>('Session', SessionSchema);
