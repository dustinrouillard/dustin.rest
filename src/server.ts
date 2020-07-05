import 'module-alias/register';

import fastify from 'fastify';

import { PortConfig } from './modules/config';

import './modules/helpers/spotify';

import 'tasks';

import { Log } from '@dustinrouillard/fastify-utilities/modules/logger';
import { Logger, Missing } from '@dustinrouillard/fastify-utilities/modules/request';

import { Route } from './routes';

const server = fastify();

// Register request logger
server.register(Logger);

// Routes
server.register(Route);
server.register(Missing);

server.listen(PortConfig, () => Log(`Server ready on ${PortConfig}`));
