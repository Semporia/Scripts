import { ICommon } from '../interfaces/ICommon';
import mongoose from 'mongoose';

const JxFactory = new mongoose.Schema(
  {
    value: String,
    name: String,
    type: Number,
  }
);

export default mongoose.model<ICommon & mongoose.Document>('jx-factory', JxFactory, 'jx-factory');
