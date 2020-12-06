import { ICommon } from '../interfaces/ICommon';
import mongoose from 'mongoose';

const jxNc = new mongoose.Schema(
  {
    value: String,
    name: String,
    type: Number,
  }
);

export default mongoose.model<ICommon & mongoose.Document>('jx-nc', jxNc, 'jx-nc');
