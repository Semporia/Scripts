import { ICommon } from '../interfaces/ICommon';
import mongoose from 'mongoose';

const ddXw = new mongoose.Schema(
  {
    value: String,
    name: String,
    type: Number,
  }
);

export default mongoose.model<ICommon & mongoose.Document>('code', ddXw, 'code');
