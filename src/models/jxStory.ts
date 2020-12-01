import { ICommon } from '../interfaces/ICommon';
import mongoose from 'mongoose';

const JxStory = new mongoose.Schema(
  {
    value: String,
    name: String,
    type: Number,
  }
);

export default mongoose.model<ICommon & mongoose.Document>('jx-story', JxStory, 'jx-story');
