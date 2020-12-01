import { Router, Request, Response, NextFunction } from 'express';
import { Container } from 'typedi';
import ShiCiService from '../../services/shiCi';
import { celebrate, Joi } from 'celebrate';
import { Logger } from 'winston';
const route = Router();

export default (app: Router) => {
  app.use('/', route);
  route.get('/shici', async (req: Request, res: Response, next: NextFunction) => {

    const logger:Logger = Container.get('logger');
    try {
      const shiServiceInstance = Container.get(ShiCiService);
      const { shici } = await shiServiceInstance.getShiCi();
      return res.status(200).json({ code: 200, data: shici });
    } catch (e) {
      logger.error('🔥 error: %o', e);
      return next(e);
    }
  });
};
