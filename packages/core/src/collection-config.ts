import fs from "node:fs";
import path from "node:path";
import { create as createTsNodeService } from "ts-node";

import type { CollectionConfig } from "astro:content";

import { logger } from "./logger";

export function findCollectionDir(searchPath: string): string {
  const contentDir = fs.existsSync(path.join(searchPath, "src/content"))
    ? path.join(searchPath, "src/content")
    : searchPath;
  
  return contentDir;
}

export async function loadCollectionConfig(contentDir: string): Promise<{
  isTypeScript?: boolean;
  buffer: Buffer;
}> {
  const contentDirFiles = fs.readdirSync(contentDir);

  let configPath = contentDirFiles.find((name) => name.match(/^config\.(t|j|mj)s$/i));

  if (!configPath) throw new Error("Config file was not detected. It must be: config.js, config.mjs, or config.ts");

  configPath = path.join(contentDir, configPath);

  const isTypeScript = path.extname(configPath) === "ts";
  const buffer = await fs.promises.readFile(configPath);

  return { isTypeScript, buffer };
}

export interface CompiledCollectionConfig<S> {
  collections: Record<string, CollectionConfig<S>>;
}

export async function compileCollectionConfig(basePath: string, { isTypeScript, buffer }: { isTypeScript?: boolean; buffer: Buffer }) {
  let rawdata = buffer.toString();

  if (isTypeScript) {
    logger.info("TypeScript config file detected.");

    const tsc = createTsNodeService({ projectSearchDir: basePath, files: true });

    rawdata = tsc.compile(rawdata, "config.ts");
  }

  // 번들러를 거치지 않아 Virtual URI (e.g. astro:content)를 해석할 수 없다.
  // 그래서 z는 zod에서 직접, defineCollection은 더미 함수로 대체한다.
  const dummyLibs = "import { z } from 'zod';" + "const defineCollection = (o) => o;";
  // 기존 임포트 부분은 제거
  rawdata = rawdata.replace(/import\s+\{[^\}]*\}\s+from\s+['"]astro\:content['"]\s*;*/gi, "");

  const TMPED_CONFIG_PATH = path.join(__dirname, "__tmp_config.mjs");

  // 임시 파일 생성
  await fs.promises.writeFile(TMPED_CONFIG_PATH, dummyLibs + rawdata);

  const module = (await import(TMPED_CONFIG_PATH)) as CompiledCollectionConfig<any>;

  // 임시 파일 제거
  await fs.promises.rm(TMPED_CONFIG_PATH);

  return module;
}
