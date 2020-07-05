import { CronJob } from 'cron';

import { CassandraClient } from '@dustinrouillard/database/cassandra';

import { Fetch } from '@dustinrouillard/fastify-utilities/modules/fetch';
import { Log } from '@dustinrouillard/fastify-utilities/modules/logger';
import { WakatimeConfig } from 'modules/config';

interface SecondsAndDate {
  seconds: number;
  date: string;
}

const CRON = '*/5 * * * *';

async function GetDevelopmentHours(): Promise<void> {
  // Pull statistics from wakatime user
  const stats = await Fetch(`https://wakatime.com/share/@${WakatimeConfig.User}/${WakatimeConfig.Id}.json`);
  const mapped_data = stats.data.map((item: { grand_total: { total_seconds: number }; range: { date: string } }) => {
    return { seconds: item.grand_total.total_seconds, date: item.range.date };
  });

  const queries = mapped_data.map((data: SecondsAndDate) => {
    return { query: 'INSERT INTO daily_development_hours (date, seconds) VALUES (?, ?)', params: [new Date(data.date), data.seconds] };
  });

  await CassandraClient.batch(queries);
}

const Job = new CronJob(CRON, GetDevelopmentHours, null, true, 'America/Los_Angeles');

(async (): Promise<void> => {
  Log(`Starting task runner for getting development hours [${CRON}]`);
  GetDevelopmentHours();
  Job.start();
})();
