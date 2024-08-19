#!/usr/bin/env node --no-warnings=ExperimentalWarning

import { findCollectionDir, generateFrontmatter, logger, parseFrontmatterSchema } from "@astro-templater/core";
import { program } from "commander";
import inquirer from "inquirer";
import fs from "node:fs";
import { EOL } from "node:os";
import path from "node:path";
import { z, ZodFirstPartyTypeKind } from "zod";
import packageJson from "../package.json" assert { type: "json" };
import { loader } from "./loader.js";
import { parseZodType } from "./parse-def.js";

const __cwd = process.cwd();

/**
 * CLI
 */

program
  .name("astro-templater")
  .version(packageJson.version)
  .description("generate *.md(x) with proper frontmatter following config.ts of astro content collection");

/**
 * Common Options
 */

interface OptionValues {
  path: string;
}

program.option("-p, --path <path>", "set a path of content collection", __cwd);

/**
 * Command: new <collection name> [filename]
 */

program
  .command("new")
  .description("generate new content file.")
  .argument("<collection name>", "collection name")
  .argument("[filename]", "generated file name")
  .option("-x, --mdx", "generate *.mdx instead of *.md")
  .action(async (collectionName: string, fileName: string | undefined, options) => {
    const basePath = program.opts<OptionValues>().path;
    const ext = options.mdx ? "mdx" : "md";

    // basePath로부터 src/content/(config.js) 위치 검색
    const collectionDir = findCollectionDir(basePath);

    // 해당 위치에서 config.js 파일 동적으로 읽어오고 필요 시 컴파일
    const collectionConfig = await loader(collectionDir);

    // 필요한 collection name 필터링
    const collection = Object.entries(collectionConfig.collections).find(([name]) => name === collectionName)?.[1];

    if (!collection) throw new Error(`Collection named '${collectionName}' is not found.`);

    // 해당 collection의 zod 스키마
    const schema = collection.schema;

    if (!(schema instanceof z.ZodObject)) throw new Error("Schema of the collection is not an instance of ZodObject.");

    /**
     * File Name Prompting
     */

    // filename이 파라미터로 주어지지 않았다면, 입력받는다.
    if (!fileName) {
      fileName = await inquirer
        .prompt({
          name: "filename",
          message: "*file name (string): ",
          type: "input",
          validate(input) {
            return !!input || "This field is required";
          },
        })
        .then((answer) => answer.filename);
    }

    const fileNameWithExt = path.extname(fileName!!).length ? `${fileName}` : `${fileName}.${ext}`;

    /**
     * Frontmatter Prompting
     */

    const receivedObject = await inquirer.prompt(
      Object.entries(schema.shape).map((it) => {
        const [name, attrDef] = it as [string, z.AnyZodObject];

        const { typeName, defaultValue, optional, nullable } = parseZodType(attrDef);

        // TODO: Zod 자체적으로 required 구분할 수 있도록 (+ validator에 통합)
        const required = !optional && !nullable;

        const [inquirerType, inquirerValidator] = (() => {
          switch (typeName) {
            case z.ZodFirstPartyTypeKind.ZodBoolean:
              return ["checkbox", (input: any) => z.boolean().safeParse(input).success || "must be a boolean"];
            case z.ZodFirstPartyTypeKind.ZodArray:
              return ["rawlist", (input: any) => z.array(z.any()).safeParse(input).success || "must be an array"];
            case z.ZodFirstPartyTypeKind.ZodDate:
              return ["input"];
            case z.ZodFirstPartyTypeKind.ZodString:
              return ["input"];
            default:
              return ["input"];
          }
        })();

        const attrType = (() => {
          switch (typeName) {
            case ZodFirstPartyTypeKind.ZodBoolean:
              return "boolean";
            case ZodFirstPartyTypeKind.ZodDate:
              return "date";
            case ZodFirstPartyTypeKind.ZodArray:
              return "array";
            default:
              return typeName.slice(3).toLowerCase();
          }
        })();

        return {
          name,
          message: `${required ? "*" : " "}${name}(${attrType}): `,

          // TODO: Zod parsing과 연계하여 띄우기
          default: defaultValue,

          // TODO: Date와 같은 데이터타입에 따라 변화
          type: inquirerType,

          // TODO: 각 데이터타입마다 알맞은 validator 설정
          validate(input) {
            if (!required && !input) {
              return true;
            }

            if (required && !input && defaultValue === undefined) {
              return "This field is required!";
            }

            switch (attrType) {
              case "date":
                return z.date().safeParse(input).success || "This field must be a Date!";
              case "boolean":
                return z.boolean().safeParse(input).success || "This field must be a Boolean!";
              case "array":
                return z.array(z.any()).safeParse(input).success || "This field must be an Array!";
            }

            return true;
          },

          // 빈 문자열 처리
          filter(input) {
            if (!input) return undefined;

            switch (attrType) {
              // Astro에서 Date는 ISO8601 형식으로 받는다.
              case "date":
                return new Date(input) || undefined;
              case "boolean":
                return Boolean(input);
              default:
                return String(input);
            }
          },
        };
      })
    );

    const parsedObject = parseFrontmatterSchema(schema, receivedObject);

    const yamlFrontmatter = generateFrontmatter(parsedObject);

    /**
     * Creating file
     */

    // TODO: new line 모드 설정 옵션 제공 (LF, CRLF) -> 현재는 OS에 따라 고정
    const frontmatter = "---" + EOL + yamlFrontmatter.trim() + EOL + "---" + EOL;

    await fs.promises.writeFile(path.join(collectionDir, collectionName, fileNameWithExt), frontmatter).then(
      (res) => {
        logger.success(`Successfully created ${path.join(collectionDir, collectionName, fileNameWithExt)}`);
      },
      (err) => {
        logger.failed("Error occured while writing new file.");
        logger.error(err);
      }
    );
  });

try {
  program.parse();
} catch (err) {
  if (err instanceof Error) {
    console.error(err.message);
  } else {
    throw err;
  }
}
