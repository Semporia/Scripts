import { ICommon } from '../interfaces/ICommon';
import mongoose from 'mongoose';

const ddFactory = new mongoose.Schema(
  {
    value: String,
    name: String,
    type: Number,
  }
);

export default mongoose.model<ICommon & mongoose.Document>('factory', ddFactory, 'factory');
