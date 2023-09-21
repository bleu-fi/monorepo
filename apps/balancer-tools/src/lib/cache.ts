/* eslint-disable no-console */
import "server-only";

import { kv } from "@vercel/kv";
import fs from "fs";
import util from "util";

import { BASE_URL } from "#/app/apr/(utils)/types";

const memoryCache: Record<string, unknown> = {};

const writeFile = util.promisify(fs.writeFile);
const readFile = util.promisify(fs.readFile);
const exists = util.promisify(fs.exists);
const mkdir = util.promisify(fs.mkdir);

const ensureDirectoryExistence = async (filePath: string) => {
  try {
    if (!(await exists(filePath))) {
      await mkdir(filePath, { recursive: true });
    }
  } catch (error) {
    console.error(`Error ensuring directory existence: ${error}`);
  }
};

export const FILE_CACHE = {
  async set(cacheKey: string, data?: Record<string, unknown>) {
    await ensureDirectoryExistence("./.cache");
    try {
      await writeFile(`./.cache/${cacheKey}.json`, JSON.stringify(data));
    } catch (error) {
      console.error(`File cache error while writing: ${error}`);
      throw new Error("Could not write to cache file.");
    }
  },

  async get<T>(cacheKey: string): Promise<T | null> {
    await ensureDirectoryExistence("./.cache");
    try {
      if (await exists(`./.cache/${cacheKey}.json`)) {
        const content = await readFile(`./.cache/${cacheKey}.json`, "utf-8");
        return JSON.parse(content) as T;
      }
    } catch (error) {
      console.error(`File cache error while reading: ${error}`);
    }
    return null;
  },
};

export const MEMORY_CACHE = {
  set(cacheKey: string, data?: Record<string, unknown>) {
    memoryCache[cacheKey] = data;
  },

  get<T>(cacheKey: string) {
    return memoryCache[cacheKey] as T;
  },
};

export const KV = {
  async set(cacheKey: string, data?: Record<string, unknown>) {
    await kv.set(cacheKey, data);
  },

  async get<T>(cacheKey: string) {
    const cached = await kv.get<T>(cacheKey);

    if (cached) {
      console.debug(`KV cache hit cache key: ${cacheKey}`);
      return cached;
    }
  },
};

export const getDataFromCacheOrCompute = async <T>(
  key: false | string | null,
  computeFn: () => Promise<T>,
): Promise<T> => {
  if (!key) {
    return computeFn();
  }

  const cacheKey = `cache:${new URL(BASE_URL).hostname}:${key}`;

  if (MEMORY_CACHE.get(cacheKey)) {
    console.debug(`Memory cache hit for ${cacheKey}`);
    return MEMORY_CACHE.get<T>(cacheKey);
  }

  if (process.env.NODE_ENV === "development") {
    try {
      const fileCached = await FILE_CACHE.get<T>(cacheKey);
      if (fileCached) {
        console.debug(`File cache hit for ${cacheKey}`);
        return fileCached;
      }
    } catch (error) {
      console.error(`File cache error: ${error}`);
    }
    console.debug(`Cache miss for ${cacheKey}`);
    const computedData = await computeFn();
    if (computedData) {
      try {
        FILE_CACHE.set(cacheKey, computedData);
      } catch (error) {
        console.error(`File cache error: ${error}`);
      }
    }
    return computedData;
  }

  try {
    const cached = await KV.get<T>(cacheKey);

    if (cached) {
      MEMORY_CACHE.set(cacheKey, cached);
      return cached;
    }
  } catch (error) {
    console.error(`KV cache error: ${error}`);
  }

  console.debug(`Cache miss for ${cacheKey}`);
  const computedData = await computeFn();

  if (computedData) {
    MEMORY_CACHE.set(cacheKey, computedData);
    try {
      KV.set(cacheKey, computedData);
    } catch (error) {
      console.error(`KV cache error: ${error}`);
    }
  }

  return computedData;
};

const serializeArgs = (args: Array<unknown>) => {
  return args
    .map((arg) => (arg ? JSON.stringify(arg).replace(/[^a-zA-Z0-9]/g, "") : ""))
    .join("-");
};

type ComputeFn<T, Args extends Array<unknown>> = (...args: Args) => Promise<T>;

export const withCache = <T, Args extends Array<unknown>>(
  fn: ComputeFn<T, Args>,
): ComputeFn<T, Args> => {
  return async (...args: Args) => {
    const serializedArgs = serializeArgs(args);
    const cacheKey = `fn:${fn.name}:${serializedArgs}`;
    return getDataFromCacheOrCompute(cacheKey, () => fn(...args));
  };
};
