import { writeFile, access, mkdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';

export interface WriteOptions {
  overwrite?: boolean;
}

export async function fileExists(filePath: string): Promise<boolean> {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

export async function ensureDir(filePath: string): Promise<void> {
  const dir = dirname(filePath);
  await mkdir(dir, { recursive: true });
}

export async function writeOutput(
  content: string,
  outputPath: string,
  options: WriteOptions = {}
): Promise<{ path: string; overwritten: boolean }> {
  const absolutePath = resolve(outputPath);
  const exists = await fileExists(absolutePath);

  if (exists && options.overwrite === false) {
    throw new Error(`File already exists: ${absolutePath}. Use --force to overwrite.`);
  }

  await ensureDir(absolutePath);
  await writeFile(absolutePath, content, 'utf-8');

  return {
    path: absolutePath,
    overwritten: exists,
  };
}
