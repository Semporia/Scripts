import { ICommon } from '../interfaces/ICommon';
import mongoose from 'mongoose';

const jxCfd = new mongoose.Schema(
  {
    value: String,
    name: String,
    type: Number,
  }
);

export default mongoose.model<ICommon & mongoose.Document>('jx-cfd', jxCfd, 'jx-cfd');
