import { compileCollectionConfig, findCollectionDir, loadCollectionConfig, logger } from "@astro-templater/core";
import chalk from "chalk";

export async function loader(collectionDir: string) {
  logger.info(chalk.bold("* Just started loading config file..."));

  const collectionConfigBuffer = await loadCollectionConfig(collectionDir).then(
    (res) => {
      logger.success(`Successfully load config file from ${collectionDir}`);
      return res;
    },
    (err) => {
      logger.failed("Error occured while loading config file");
      throw err;
    }
  );
  
  const collectionConfig = await compileCollectionConfig(collectionDir, collectionConfigBuffer).then(
    (res) => {
      logger.success(`Successfully compile config file`);
      return res;
    },
    (err) => {
      logger.failed("Error occured while compiling config file");
      throw err;
    }
  );

  return collectionConfig;
}
