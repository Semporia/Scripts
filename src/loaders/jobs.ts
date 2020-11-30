import config from '../config';
import DeleteCodeJob from '../jobs/deleteCode';
import Agenda from 'agenda';

export default ({ agenda }: { agenda: Agenda }) => {
  agenda.define(
    'delete-code',
    { priority: 'high', concurrency: config.agenda.concurrency },
    new DeleteCodeJob().handler,
  );

  agenda.start();
};
