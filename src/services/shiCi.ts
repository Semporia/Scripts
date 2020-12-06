import { Service, Inject } from 'typedi';
import { IContent } from '../interfaces/IContent';

@Service()
export default class ShiCiService {
  constructor(
    @Inject('shi') private shi: Models.IContentModel,
    @Inject('ci') private ci: Models.IContentModel,
    @Inject('lunYu') private lunYu: Models.IContentModel,
    @Inject('shiJing') private shiJing: Models.IContentModel,
    @Inject('logger') private logger
  ) {
  }

  public async getShiCi(): Promise<{ shici: IContent }> {
    const obj = {
      0: this.shi,
      1: this.ci,
      2: this.shiJing,
      3: this.lunYu
    }
    const random = Math.floor(Math.random() * 4);
    const [record] = await obj[random].aggregate([{ $sample: { size: 1 } }]);
    if (!record) {
      throw new Error('get shici error');
    }
    return { shici: record };
  }

}
