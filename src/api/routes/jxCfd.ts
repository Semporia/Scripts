import { Router, Request, Response, NextFunction } from 'express';
import { Container } from 'typedi';
import ShareCodeService from '../../services/shareCode';
import { celebrate, Joi } from 'celebrate';
import { Logger } from 'winston';
import { ShareCodeType } from '../../interfaces/ICommon';
import config from '../../config';
const route = Router();

export default (app: Router) => {
  app.use('/jx-cfd', route);
  route.post(
    '/:code/:name',
    celebrate({
      params: Joi.object({
        code: Joi.string().required(),
        name: Joi.string().required(),
      }),
    }),
    async (req: Request, res: Response, next: NextFunction) => {
      const logger: Logger = Container.get('logger');
      try {
        const serviceInstance = Container.get(ShareCodeService);
        const { code } = await serviceInstance.createCode({
          name: req.params.name,
          code: req.params.code,
          type: ShareCodeType['jxCfd'],
        });
        return res.status(200).json({ code: 200, data: code });
      } catch (e) {
        logger.error('🔥 error: %o', e);
        return next(e);
      }
    },
  );

  route.get('/', async (req: Request, res: Response, next: NextFunction) => {
    const logger: Logger = Container.get('logger');
    try {
      const serviceInstance = Container.get(ShareCodeService);
      const { code } = await serviceInstance.getCode(ShareCodeType['jxCfd']);
      return res.status(200).json({ code: 200, data: code });
    } catch (e) {
      logger.error('🔥 error: %o', e);
      return next(e);
    }
  });

  route.get('/count', async (req: Request, res: Response, next: NextFunction) => {
    const logger: Logger = Container.get('logger');
    try {
      const serviceInstance = Container.get(ShareCodeService);
      const { count } = await serviceInstance.countCode(ShareCodeType['jxCfd']);
      return res.status(200).json({ code: 200, count });
    } catch (e) {
      logger.error('🔥 error: %o', e);
      return next(e);
    }
  });

  route.get(
    '/remove',
    celebrate({
      query: Joi.object({
        token: Joi.string().required().equal(config.secret),
      }),
    }),
    async (req: Request, res: Response, next: NextFunction) => {
      const logger: Logger = Container.get('logger');
      try {
        const serviceInstance = Container.get(ShareCodeService);
        const { msg } = await serviceInstance.removeCode(ShareCodeType['jxCfd']);
        return res.status(200).json({ code: 200, msg });
      } catch (e) {
        logger.error('🔥 error: %o', e);
        return next(e);
      }
    },
  );
};
