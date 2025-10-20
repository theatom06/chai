import { spawn } from 'child_process';
import fs from 'fs/promises';
import path from 'path';

/**
 * Extracts a tarball (.tgz/.tar.gz/.tar) into the destination directory using system `tar`.
 * @param {string} archivePath - path to tarball
 * @param {string} destDir - destination directory
 */
export async function extractTarballAsync(archivePath: string, destDir: string): Promise<void> {
  await fs.mkdir(destDir, { recursive: true });
  // Try gz first, then generic tar
  const argsGz = ['-xzf', archivePath, '-C', destDir, '--strip-components', '1'];
  const argsTar = ['-xf', archivePath, '-C', destDir, '--strip-components', '1'];

  await new Promise<void>((resolve, reject) => {
    const child = spawn('tar', argsGz, { stdio: 'ignore' });
    child.on('exit', (code) => {
      if (code === 0) return resolve();
      // retry without gzip flag
      const retry = spawn('tar', argsTar, { stdio: 'ignore' });
      retry.on('exit', (code2) => {
        if (code2 === 0) resolve();
        else reject(new Error(`tar extraction failed with codes ${code} and ${code2}`));
      });
    });
    child.on('error', (err) => reject(err));
  });
}
