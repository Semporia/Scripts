import { ICommon } from '../interfaces/ICommon';
import mongoose from 'mongoose';

const JxFactoryTuan = new mongoose.Schema(
  {
    value: String,
    name: String,
    type: Number,
  }
);

export default mongoose.model<ICommon & mongoose.Document>('jx-factory-tuan', JxFactoryTuan, 'jx-factory-tuan');
