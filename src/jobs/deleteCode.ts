import { Container } from 'typedi';
import ShareCodeService from '../services/shareCode';
import { Logger } from 'winston';
import { ShareCodeType } from '../interfaces/ICommon';

export default class EmailSequenceJob {
  public async handler(job, done): Promise<void> {
    const Logger: Logger = Container.get('logger');
    try {
      Logger.debug('✌️ Email Sequence Job triggered!');
      const { email, name }: { [key: string]: string } = job.attrs.data;
      const serviceInstance = Container.get(ShareCodeService);
      await serviceInstance.removeCode(ShareCodeType['ddXw']);
      done();
    } catch (e) {
      Logger.error('🔥 Error with Email Sequence Job: %o', e);
      done(e);
    }
  }
}
