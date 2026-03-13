import { Key, TableColumns, TableCommand } from '../../core/index.js';

export default class KeyListCommand extends TableCommand {
  static columns: TableColumns<Key> = {
    suffix: { name: 'Suffix', description: 'API key suffix' },
    orgId: { name: 'Org ID', description: 'Org ID' },
    domain: { name: 'Domain', description: 'Fullstory API domain' },
    selected: { name: 'Selected', description: 'Indicates if a key is selected for use' },
  };

  static description = 'List locally stored API keys and their corresponding org IDs.';

  static enableJsonFlag = true;

  static examples = [
    { command: '<%= config.bin %> key', description: 'List locally stored API keys.' },
  ];

  static summary = 'List API keys.';

  async run() {
    const keystore = this.readKeystore();

    if (Object.keys(keystore).length === 0) {
      this.log(`Run ${this.config.bin} key:add to add your first API key.`);
      return;
    }

    return this.table(Object.values(keystore), KeyListCommand.columns);
  }
}
