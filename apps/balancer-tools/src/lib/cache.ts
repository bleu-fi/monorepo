import "server-only";

// import { kv } from "@vercel/kv";
import crypto from "crypto";
import fs from "fs";
import { createClient } from "redis";
import util from "util";

import { BASE_URL } from "#/app/apr/(utils)/types";

const kv = await createClient({
  // url: 'redis://localhost:6379'
  url: process.env.REDIS_URL
// eslint-disable-next-line no-console
}).on('error', err => console.log('Redis Client Error', err))
.connect();

export type ComputeFn<
  T = unknown,
  Args extends Array<unknown> = Array<unknown>,
> = (...args: Args) => Promise<T>;

const hashCache: Record<string, string> = {};

const hashFunction = <
  T = unknown,
  Args extends Array<unknown> = Array<unknown>,
>(
  fn: ComputeFn<T, Args>,
): string => {
  const fnStr = fn.toString();
  if (hashCache[fnStr]) return hashCache[fnStr];
  const hash = crypto.createHash("sha256");
  hash.update(fnStr);
  const hashValue = hash.digest("hex");
  hashCache[fnStr] = hashValue;
  return hashValue;
};

const hashString = (input: string): string => {
  if (hashCache[input]) return hashCache[input];

  const hash = crypto.createHash("sha256");
  hash.update(input);
  const hashValue = hash.digest("hex");

  hashCache[input] = hashValue;
  return hashValue;
};

const memoryCache: Record<string, unknown> = {};
const promisifiedFs = {
  writeFile: util.promisify(fs.writeFile),
  readFile: util.promisify(fs.readFile),
  exists: util.promisify(fs.exists),
  mkdir: util.promisify(fs.mkdir),
};

// const ensureDirectoryExistence = async (filePath: string) => {
//   if (!(await promisifiedFs.exists(filePath)))
//     await promisifiedFs.mkdir(filePath, { recursive: true });
// };

const handleCacheError = (error: unknown, action: string) => {
  const errorMsg = error instanceof Error ? error : new Error(String(error));
  // eslint-disable-next-line no-console
  console.error(`Cache error during ${action}: ${errorMsg}`);
};

const transformCacheKey = (key: string) => key.replace(/[<>:"/\\|?*]/g, "_");
const cacheFilePath = (key: string) =>
  `./.cache/${transformCacheKey(key)}.json`;

const readAndParseFile = async <T>(key: string): Promise<T | null> => {
  try {
    const filePath = cacheFilePath(key);
    if ((await promisifiedFs.exists(filePath)) && key) {
      const content = await promisifiedFs.readFile(filePath, "utf-8");
      return JSON.parse(content) as T;
    }
  } catch (error) {
    handleCacheError(error, "read");
  }
  return null;
};

// const writeToFileCache = async (key: string, data: unknown) => {
//   await ensureDirectoryExistence("./.cache");
//   try {
//     const filePath = cacheFilePath(key);
//     if (data) {
//       await promisifiedFs.writeFile(filePath, JSON.stringify(data));
//     }
//   } catch (error) {
//     handleCacheError(error, "write");
//   }
// };

const serializeArgs = (args: Array<unknown>) =>
  args.map((arg) => (arg ? JSON.stringify(arg) : "")).join("-");
const getFromMemoryCache = <T>(key: string): T | null => memoryCache[key] as T;

const getFromFileCache = async <T>(key: string): Promise<T | null> => {
  if (process.env.NODE_ENV === "development")
    return await readAndParseFile<T>(key);
  return null;
};

const getFromKVCache = async <T>(key: string): Promise<T| null> => {
  if (process.env.NODE_ENV === "development") {
    try {
      const res =  await kv.get(key);
      return res ? JSON.parse(res) : res
    } catch (error) {
      handleCacheError(error, "KV read");
    }
  }
  return null;
};

const updateAllCaches = async <T>(key: string, data: T): Promise<void> => {
  if (data !== null) {
    memoryCache[key] = data;
    // if (process.env.NODE_ENV === "development")
    //   await writeToFileCache(key, data);
    if (process.env.NODE_ENV === "development") {
      try {
        await kv.set(key, JSON.stringify(data));
      } catch (error) {
        handleCacheError(error, "KV write");
      }
    }
  }
};

const getDataFromCacheOrCompute = async <T>(
  key: string,
  computeFn: () => Promise<T>,
): Promise<T> => {
  const cacheKey = `cache:${new URL(BASE_URL).hostname}:${key}`;
  const memoryCached = getFromMemoryCache<T>(cacheKey);
  if (memoryCached) return memoryCached;
  const fileCached = await getFromFileCache<T>(cacheKey);
  if (fileCached) return fileCached;
  const kvCached = await getFromKVCache<T>(cacheKey);
  if (kvCached) return kvCached;
  const computedData = await computeFn();
  await updateAllCaches(cacheKey, computedData);
  return computedData;
};

export const withCache = <T, Args extends Array<unknown>>(
  fn: ComputeFn<T, Args>,
): ComputeFn<T, Args> => {
  return async (...args: Args) => {
    const serializedArgs = serializeArgs(args);
    const hashedFn = hashFunction(fn);
    const hashedArgs = hashString(serializedArgs);
    const cacheKey = `fn:${
      fn.name ? `${fn.name}_` : ""
    }${hashedFn}:${hashedArgs}`;
    return getDataFromCacheOrCompute(cacheKey, () => fn(...args));
  };
};
