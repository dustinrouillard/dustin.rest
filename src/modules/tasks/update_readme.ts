import { CronJob } from 'cron';

import { Fetch } from '@dustinrouillard/fastify-utilities/modules/fetch';
import { Log, Debug } from '@dustinrouillard/fastify-utilities/modules/logger';

import { FetchStatistics, FetchDailyStatistics } from 'helpers/stats';
import { FormatSeconds } from 'modules/utils/time';
import { GithubConfig } from 'modules/config';
import { GenerateGithubTable } from 'modules/utils/table';

const CRON = '*/5 * * * *';

async function UpdateGitHubReadme(): Promise<void> {
  // Map out variables
  const weekly_db_stats = await FetchStatistics();
  const daily_db_stats = await FetchDailyStatistics();

  const weekly_stats = {
    hours: FormatSeconds(weekly_db_stats.development_seconds),
    commands: weekly_db_stats.commands_ran.toLocaleString(),
    builds: weekly_db_stats.builds_ran.toLocaleString()
  };

  const daily_stats = {
    hours: FormatSeconds(daily_db_stats.development_seconds),
    commands: daily_db_stats.commands_ran.toLocaleString(),
    builds: daily_db_stats.builds_ran.toLocaleString()
  };

  // Generate the fancy table
  const stats_table = GenerateGithubTable(daily_stats, weekly_stats);

  let change = true;

  try {
    // Fetch the current gist contents
    const readme_md = await Fetch(`https://api.github.com/repos/${GithubConfig.Username}/${GithubConfig.Username}/readme`, {
      method: 'get',
      headers: { authorization: `Bearer ${GithubConfig.Token}` }
    });

    const github_readme = Buffer.from(readme_md.content, 'base64').toString();

    const old_table_p1 = '| Title' + github_readme.split('| Title')[1];
    if (!old_table_p1) change = true;
    const old_table_p2 = old_table_p1.split('\n\n######')[0];
    if (!old_table_p2) change = true;

    if (old_table_p2 == stats_table) change = false;

    // Ignore the change if the contents is the same
    if (!change) return;

    // Update the contents of the gist
    await Fetch(`https://api.github.com/repos/${GithubConfig.Username}/${GithubConfig.Username}/contents/README.md`, {
      method: 'put',
      headers: { authorization: `Bearer ${GithubConfig.Token}` },
      json: {
        message: 'Updating 7-day statistics',
        content: Buffer.from(github_readme.replace(old_table_p2, stats_table), 'utf8').toString('base64'),
        sha: readme_md.sha,
        author: {
          name: 'dustin.rest - API Automation',
          email: 'code@dustin.sh'
        }
      }
    });
  } catch (error) {
    Debug('Error with updating statistics', error);
  }
}

const Job = new CronJob(CRON, UpdateGitHubReadme, null, true, 'America/Los_Angeles');

export async function Activate(): Promise<void> {
  Log(`Starting task runner for updating readme [${CRON}]`);
  UpdateGitHubReadme();
  Job.start();
  return;
}
