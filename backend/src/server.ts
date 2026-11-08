import http from 'node:http';
import { createApp } from './app';
import { attachPush } from './push';

const port=Number(process.env.VUENO_PORT ?? 9001);
const host=process.env.VUENO_HOST ?? '0.0.0.0';
const server=http.createServer(createApp());
attachPush(server);
server.listen(port,host,()=>console.log(`Vueno Node backend listening on http://${host}:${port}`));
