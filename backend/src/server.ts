import http from 'node:http';
import path from 'node:path';
import { createApp } from './app';
import { attachPush } from './push';
import { writeOgImageUrls } from './og-image';

const port=Number(process.env.VUENO_PORT ?? 9001);
const host=process.env.VUENO_HOST ?? '0.0.0.0';

const domain = process.argv[2];
if (!domain && process.env.npm_lifecycle_event !== 'dev') {
  console.error('Missing domain. Start the server with: npm run start <domain>');
  process.exit(1);
}

if (domain) {
  try {
    const origin = writeOgImageUrls(path.resolve(__dirname, '../static'), domain);
    console.log(`Open Graph image URLs configured for ${origin}`);
  } catch (error) {
    console.error(`Could not configure Open Graph image URLs: ${error instanceof Error ? error.message : error}`);
    process.exit(1);
  }
}

const server=http.createServer(createApp());
attachPush(server);
// noinspection HttpUrlsUsage local
server.listen(port,host,()=>console.log(`Vueno Node backend listening on http://${host}:${port}`));
