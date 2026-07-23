import { readdir, stat } from 'node:fs/promises';
import path from 'node:path';

const assetsDir = path.resolve('dist/assets');
const files = await readdir(assetsDir);
const javascript = await Promise.all(files.filter((file) => file.endsWith('.js')).map(async (file) => ({ file, bytes: (await stat(path.join(assetsDir, file))).size })));
const largest = javascript.sort((a, b) => b.bytes - a.bytes)[0];
const limit = 400 * 1024;
if (!largest || largest.bytes > limit) {
  throw new Error(`JavaScript performance budget exceeded: ${largest?.file ?? 'no bundle'} is ${largest?.bytes ?? 0} bytes; limit is ${limit}.`);
}
console.log(`Performance budget passed: largest JavaScript asset is ${largest.file} (${Math.round(largest.bytes / 1024)} KiB / 400 KiB).`);
