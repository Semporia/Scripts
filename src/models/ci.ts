import { IContent } from '../interfaces/IContent';
import mongoose from 'mongoose';

const Ci = new mongoose.Schema(
  {
    author: String,
    paragraphs: [{
        type: String
    }],
    title: String,
    id: String,
    created_at: {type: Number, default: (Date.now()/1000).toPrecision(10)}
  }
);

export default mongoose.model<IContent & mongoose.Document>('ci', Ci, 'ci');
