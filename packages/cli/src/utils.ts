import { z } from "zod";

export function getZodDefault(schema: z.AnyZodObject) {
  if (schema instanceof z.ZodDefault) {
    // ref: https://github.com/colinhacks/zod/discussions/1953
    // @ts-ignore
    return schema._def.defaultValue();
  } else {
    return undefined;
  }
}

export function getZodDefaults(schema: z.AnyZodObject) {
  throw "Not impl. yet";
}
