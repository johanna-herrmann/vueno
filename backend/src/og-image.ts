import fs from 'node:fs';
import path from 'node:path';

const htmlFiles = ['index.html', 'invitation.html'];
const ogImageMeta = /(<meta\b(?=[^>]*\bproperty=["']og:image(?::secure_url)?["'])[^>]*?\bcontent=["'])([^"']+)(["'][^>]*>)/gi;

function httpsOrigin(domain: string): string {
  const input = domain.trim();
  const url = new URL(input.includes('://') ? input : `https://${input}`);

  if (
    url.protocol !== 'https:' ||
    !url.hostname ||
    url.username ||
    url.password ||
    url.pathname !== '/' ||
    url.search ||
    url.hash
  ) {
    throw new Error('Domain must be a hostname without a path, query, or fragment.');
  }

  return url.origin;
}

export function writeOgImageUrls(staticDirectory: string, domain: string): string {
  const origin = httpsOrigin(domain);
  const updates: Array<{ filePath: string; html: string }> = [];

  for (const fileName of htmlFiles) {
    const filePath = path.join(staticDirectory, fileName);
    if (!fs.existsSync(filePath)) {
      throw new Error(`Missing ${fileName} in ${staticDirectory}. Run the frontend build first.`);
    }

    const original = fs.readFileSync(filePath, 'utf8');
    let metadataCount = 0;
    const updated = original.replace(ogImageMeta, (_match, prefix: string, currentUrl: string, suffix: string) => {
      metadataCount++;
      const relativeUrl = new URL(currentUrl, 'https://vueno.invalid');
      const relativePart = `${relativeUrl.pathname}${relativeUrl.search}${relativeUrl.hash}`;
      return `${prefix}${origin}${relativePart}${suffix}`;
    });

    if (metadataCount === 0) {
      throw new Error(`No Open Graph image metadata found in ${fileName}.`);
    }

    updates.push({ filePath, html: updated });
  }

  for (const update of updates) fs.writeFileSync(update.filePath, update.html, 'utf8');
  return origin;
}
