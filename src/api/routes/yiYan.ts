import { Router, Request, Response, NextFunction } from 'express';
import { Container } from 'typedi';
import YiYanService from '../../services/yiYan';
import { celebrate, Joi } from 'celebrate';
import fetch from 'node-fetch';
import { Logger } from 'winston';
const route = Router();

export default (app: Router) => {
  app.use('/', route);
  route.get('/yiyan', async (req: Request, res: Response, next: NextFunction) => {
    const logger:Logger = Container.get('logger');
    try {
      const yiYanServiceInstance = Container.get(YiYanService);
      const { yiYan } = await yiYanServiceInstance.getYiYan();
      return res.status(200).json({ code: 200, data: yiYan });
    } catch (e) {
      logger.error('🔥 error: %o', e);
      return next(e);
    }
  });

  route.get('/calendar', async (req: Request, res: Response, next: NextFunction) => {
    const logger: Logger = Container.get('logger');
    try {
      const text = await fetch(`https://wannianrili.51240.com/ajax/?q=${req.query.q}`, {
        method: "get",
      }).then((res) => res.text());
      res.status(200).send(text)
    } catch (e) {
      logger.error('🔥 error: %o', e);
      return next(e);
    }
  });
};
