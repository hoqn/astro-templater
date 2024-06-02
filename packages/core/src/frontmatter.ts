import { AnyZodObject, ZodObject, ZodRawShape, z } from "zod";
import yaml from "js-yaml";

export function parseFrontmatterSchema<Z extends AnyZodObject>(schema: Z, data: any): z.TypeOf<Z> {
  const parsedData = schema.parse(data);
  return parsedData;
}

export function generateFrontmatter<Z extends AnyZodObject>(data: z.TypeOf<Z>, opts?: {
  format: "json" | "yaml";
}): string {
  const { format = "yaml" } = opts || {};

  if (format === "json")
    return JSON.stringify(data);

  // yaml
  return yaml.dump(data);
}
