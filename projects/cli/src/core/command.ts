import Fullstory from '@fullstory/activation-sdk/index.js';
import { Command as OclifCommand, ux } from '@oclif/core';
import { FlagProps } from '@oclif/core/lib/interfaces/parser.js';
import { StandardChalk } from '@oclif/core/lib/interfaces/theme.js';
import { Options, SingleBar } from 'cli-progress';
import { ensureDirSync, existsSync, readJSONSync, writeJSONSync } from 'fs-extra';

export interface Key {
  apiKey: string,
  domain: string,
  orgId: string,
  selected: boolean
  suffix: string;
}

export type KeyStore = { [key: string]: Key };

/**
 * Provides a base class for all Fullstory commands.
 */
export abstract class Command extends OclifCommand {
  static readonly KeyStoreFile = 'keys.json';

  Fullstory!: Fullstory;

  progress?: SingleBar;

  get key() {
    const key = Object.values(this.readKeystore()).find(key => key.selected);

    if (key) {
      return key;
    }

    this.error(`API key not found. Run ${ux.colorize('magenta', `${this.config.bin} keys:add APIKEY`)}.`);
  }

  async init() {
    ensureDirSync(this.config.dataDir);
    const key = Object.values(this.readKeystore()).find(k => k.selected);
    if (key) {
      this.Fullstory = new Fullstory(key.apiKey, key.orgId, key.domain);
    }
  }

  /**
   * Prints text to the terminal.
   * @param text Content to print.
   * @param color Optional color of the printed text.
   * @returns void
   */
  print(text: string, color?: 'fail' | 'success' | 'warn' | StandardChalk) {
    if (color) {
      this.log(this.style(text, color));
    } else {
      this.log(text);
    }
  }

  /**
   * Retrieves the API keys from local storage.
   * @returns A `KeyStore` object containing previously stored API keys.
   */
  readKeystore(): KeyStore {
    const file = `${this.config.dataDir}/${Command.KeyStoreFile}`;

    if (existsSync(file)) {
      return readJSONSync(file);
    }

    this.writeKeystore({});
    return {};
  }

  /**
   * Displays a progress bar to the end user.
   * @param message Text that precedes progress details
   * @param total Total number of items
   * @returns A progress bar; use `increment()` to tick progress and `stop()` once all items have
   * been processed.
   */
  showProgress(message: string, total: number) {
    if (this.progress) {
      this.progress.stop();
    }

    this.progress = ux.progress({
      format: `{bar} | {value}/{total} ${message.charAt(0).toUpperCase() + message.slice(1)}`,
      barCompleteChar: '\u2588',
      barIncompleteChar: '\u2591',
    } as Options);

    this.progress.start(total, 0);
  }

  /**
   * Displays an indeterminate spinner.
   * @param message Text that precedes spinner
   * @returns void
   */
  start(message: string) {
    ux.action.start(`${message.charAt(0).toUpperCase() + message.slice(1)}`);
  }

  /**
   * Removes a previously started indeterminate spinner.
   * @param message Optional text that replaces `start` message
   */
  stop(message?: string) {
    ux.action.stop(message ? `${message.charAt(0).toUpperCase() + message.slice(1)}` : undefined);
  }

  /**
   * Styles text by adjusting color or boldness.
   * @param text Content to be styled.
   * @param color Color to style text.
   * @returns A string where all the text matches the desired style.
   */
  style(text: string, color: 'fail' | 'success' | 'warn' | StandardChalk) {
    switch (color) {
      case 'success': {
        return ux.colorize('green', text);
      }

      case 'warn': {
        return ux.colorize('yellow', text);
      }

      case 'fail': {
        return ux.colorize('red', text);
      }

      default: {
        return ux.colorize(color, text);
      }
    }
  }

  writeKeystore(keystore: KeyStore) {
    writeJSONSync(`${this.config.dataDir}/${Command.KeyStoreFile}`, keystore);
  }
}

/**
 * Table column metadata used to print tabular output.
 */
export type TableColumn<T> = {
  /* column description (shown to the user in --help output) */
  description?: string;
  /* boolean when `true` shows the column when the --extended flag is `true` */
  extended?: boolean;
  /* adapter to format output value */
  format?: (row: T) => boolean | number | string;
  /* column name (shown to the user in table output) or the literal key if name is not provided */
  name?: string;
}

export type TableColumns<T> = {
  [key: string]: TableColumn<T>;
};

// adjust the table flags so the help output is formatted differently
const tableFlags = ux.table.flags();
for (const key of Object.keys(tableFlags)) ((tableFlags as { [key: string]: FlagProps })[key]).helpGroup = 'Table';

/**
 * `TableCommand` prints tabular output.
 */
export abstract class TableCommand extends Command {
  static columns: TableColumns<any> = {};

  static enableJsonFlag = true;

  static flags = {
    ...Command.flags,
    ...tableFlags,
  };

  /**
   * Returns table rows and in doing so prints tabular output.
   * @param rows List of objects where each object is printed as a row in the table.
   * @param columns List of `TableColumn` contained in the resulting table.
   * @param summary Optional string printed below the table.
   * @returns The input data, which can be returned at the end of a command to support `--json` output.
   */
  async table<T>(rows: T[], columns: TableColumns<T>, summary?: string) {
    const { flags } = await this.parse();

    // if JSON output is desired, do not print a table or text
    if (!flags.json) {
      ux.Table.table(rows, this.toUxColumns(columns), flags);

      if (summary) {
        this.log(summary);
      }
    }

    return rows;
  }

  /**
   * Adapts columns to the native OCLIF type.
   * @param columns Columns to be adapted.
   * @returns OCLIF columns that can be used with the native table function.
   */
  private toUxColumns<T>(columns: TableColumns<T>) {
    const colKeys = Object.keys(columns);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const tableColumns: ux.Table.table.Columns<any> = {};

    for (const key of colKeys) {
      tableColumns[key] = { extended: columns[key].extended, get: columns[key].format, header: columns[key] ? columns[key].name : key };
    }

    return tableColumns;
  }
}
