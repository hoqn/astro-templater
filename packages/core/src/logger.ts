import chalk from "chalk";
import { format } from "util";

function logger(...data: any[]) {
  console.log(...data);
}

logger.info = function (...data: any[]) {
  console.log("  " + format.apply(this, data));
};

logger.success = function (...data: any[]) {
  console.log(chalk.green("✔️ " + format.apply(this, data)));
};

logger.failed = function (...data: any[]) {
  console.log(chalk.red("✕ " + format.apply(this, data)));
};

logger.error = function (...data: any[]) {
  console.error(chalk.red("! " + format.apply(this, data)));
};

export { logger };
