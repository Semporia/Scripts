import { Container } from 'typedi';
import DdXwService from '../services/ddXw';
import { Logger } from 'winston';

export default class EmailSequenceJob {
  public async handler(job, done): Promise<void> {
    const Logger: Logger = Container.get('logger');
    try {
      Logger.debug('✌️ Email Sequence Job triggered!');
      const { email, name }: { [key: string]: string } = job.attrs.data;
      const serviceInstance = Container.get(DdXwService);
      await serviceInstance.removeCode();
      done();
    } catch (e) {
      Logger.error('🔥 Error with Email Sequence Job: %o', e);
      done(e);
    }
  }
}
