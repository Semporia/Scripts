import { Document } from 'mongoose';
import { Service, Inject } from 'typedi';
import { ICommon, ShareCodeType } from '../interfaces/ICommon';

@Service()
export default class ShareCodeService {
  constructor(@Inject('shareCode') private shareCode: Models.ICommonModel, @Inject('logger') private logger) {}

  public async getCode(type: ShareCodeType, body = {}): Promise<{ code: ICommon }> {
    const [record] = await this.shareCode.aggregate([{ $match: { type, ...body } }, { $sample: { size: 1 } }]);
    if (!record) {
      throw new Error(`get ${ShareCodeType[type]} code error`);
    }
    return { code: record };
  }

  public async createCode(
    { name, code, type }: { name: string; code: string; type: ShareCodeType },
    body = {},
  ): Promise<{ code: ICommon & Document }> {
    const record = await this.shareCode.findOneAndUpdate(
      {
        $or: [
          { name, type },
          { value: code, type },
        ],
      },
      {
        value: code,
        name: name,
        type,
        ...body,
        extra: body
      },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );
    if (!record) {
      throw new Error(`create ${ShareCodeType[type]} code error`);
    }
    return { code: record };
  }

  public async countCode(type: ShareCodeType): Promise<{ count: Number }> {
    const count = await this.shareCode.countDocuments({ type });
    return { count };
  }

  public async removeCode(type: ShareCodeType): Promise<{ msg: string }> {
    const count = await this.shareCode.remove({ type });
    return { msg: 'success' };
  }
}
