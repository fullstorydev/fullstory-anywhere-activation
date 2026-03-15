import { Fmt, Key, TableColumns, TableCommand } from '../../core/index.js';

export default class KeyListCommand extends TableCommand {
  static columns: TableColumns<Key> = {
    orgId: { name: 'Org ID', description: 'Org ID' },
    selected: {
      name: 'Active', description: 'Indicates if a key is selected for use',
      format: (key: Key) => key.selected ? Fmt.infoBox('active') : '-'
    },
    domain: { name: 'Domain', description: 'Fullstory API domain' },
    suffix: { name: 'Suffix', description: 'API key suffix' },
  };

  static description = 'List locally stored API keys and their corresponding details.';

  // JSON output disabled for this command since the API key contains sensitive information
  static enableJsonFlag = false;

  static examples = [
    { command: '<%= config.bin %> key', description: 'List locally stored API keys.' },
  ];

  static summary = 'List API keys.';

  async run() {
    const keystore = this.readKeystore();

    if (Object.keys(keystore).length === 0) {
      this.log(`Run ${Fmt.cmd(this.config.bin, 'key:add')} to add your first API key.`);
      return;
    }

    return this.table(Object.values(keystore).sort((a, b) => a.orgId.localeCompare(b.orgId)),
      KeyListCommand.columns);
  }
}
