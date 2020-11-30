import { Router, Request, Response, NextFunction } from 'express';
import { Container } from 'typedi';
import YiYanService from '../../services/yiYan';
import { celebrate, Joi } from 'celebrate';
import { Logger } from 'winston';
const route = Router();

export default (app: Router) => {
  app.use('/', route);
  route.get('/yiyan', async (req: Request, res: Response, next: NextFunction) => {
    const logger:Logger = Container.get('logger');
    try {
      const yiYanServiceInstance = Container.get(YiYanService);
      const { yiYan } = await yiYanServiceInstance.getYiYan();
      return res.status(200).json({ ...yiYan });
    } catch (e) {
      logger.error('🔥 error: %o', e);
      return next(e);
    }
  });
};
