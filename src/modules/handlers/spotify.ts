import { FastifyRequest, FastifyReply } from 'fastify';

import { Success, Catch } from '@dustinrouillard/fastify-utilities/modules/response';
import { Debug } from '@dustinrouillard/fastify-utilities/modules/logger';

import { SetupSpotify, GetSpotifyAuthorization } from 'helpers/spotify';

export async function AuthorizeSpotify(req: FastifyRequest<{}, {}, {}, {}, {}>, reply: FastifyReply<{}>): Promise<void> {
  try {
    return Success(reply, 200, GetSpotifyAuthorization());
  } catch (error) {
    Debug(error);
    return Catch(reply, error);
  }
}

export async function CallbackSpotify(req: FastifyRequest<{}, { code: string }, {}, {}, {}>, reply: FastifyReply<{}>): Promise<void> {
  try {
    await SetupSpotify(req.query.code);

    return Success(reply, 200, true);
  } catch (error) {
    Debug(error);
    return Catch(reply, error);
  }
}
