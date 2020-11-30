import { Router } from 'express';
import yiYan from './routes/yiYan';
import ddXw from './routes/ddXw';
import ddFactory from './routes/ddFactory';
import jxFactory from './routes/jxFactory';
import agendash from './routes/agendash';

export default () => {
	const app = Router();
	ddXw(app);
	ddFactory(app);
	jxFactory(app);
	yiYan(app);
	agendash(app);

	return app
}
