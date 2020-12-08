import { ICommon } from '../interfaces/ICommon';
import mongoose from 'mongoose';
import config from '../config';
const yiyan = mongoose.createConnection(config.yiyanDatabaseURL, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useUnifiedTopology: true,
  useFindAndModify: false
});

const YiYan = new mongoose.Schema(
  {
    content: String,
    from: String,
    type: String,
    creator: String,
    yid: String,
    created_at: {type: Number, default: (Date.now()/1000).toPrecision(10)}
  },
  { timestamps: true },
);

export default yiyan.model<ICommon & mongoose.Document>('yiyan', YiYan, 'yiyans');
