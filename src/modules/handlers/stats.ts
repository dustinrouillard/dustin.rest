import { FastifyRequest, FastifyReply } from 'fastify';

import { Success, Catch, Failed } from '@dustinrouillard/fastify-utilities/modules/response';
import { Debug } from '@dustinrouillard/fastify-utilities/modules/logger';

import { IncrementTotalCommandCount, FetchStatistics, IncrementTotalBuildCount, FetchMonthlyStatistics, FetchDailyStatistics } from 'helpers/stats';
import { WakatimeConfig } from 'modules/config';

export async function IncrementCommandCount(req: FastifyRequest, reply: FastifyReply): Promise<void> {
  try {
    await IncrementTotalCommandCount();

    return Success(reply, 200, true);
  } catch (error) {
    Debug(error);
    return Catch(reply, error);
  }
}

export async function IncrementBuildCount(req: FastifyRequest, reply: FastifyReply): Promise<void> {
  try {
    await IncrementTotalBuildCount();

    return Success(reply, 200, true);
  } catch (error) {
    Debug(error);
    return Catch(reply, error);
  }
}

export async function GetStatistics(req: FastifyRequest, reply: FastifyReply): Promise<void> {
  try {
    const monthly = await FetchMonthlyStatistics();
    const daily = await FetchDailyStatistics();
    const weekly = await FetchStatistics();

    return Success(reply, 200, {
      daily,
      weekly,
      monthly
    });
  } catch (error) {
    Debug(error);
    return Catch(reply, error);
  }
}
