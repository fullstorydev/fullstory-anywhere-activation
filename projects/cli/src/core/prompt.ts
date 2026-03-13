import inquirer from 'inquirer';

export async function checkbox<T>(choices: ({ name: string, value: T } | string)[], message: string, defaultChoice?: T[]): Promise<T[]> {
  const { answer } = await inquirer.prompt([{
    choices: choices.map(choice => typeof choice === 'string' ? new inquirer.Separator(choice) : choice),
    message: message.charAt(0).toUpperCase() + message.slice(1),
    name: 'answer',
    pageSize: 25,
    type: 'checkbox',
    default: defaultChoice,
  }]);

  return answer;
}

export async function confirm(message: string, defaultChoice: boolean): Promise<boolean> {
  const { answer } = await inquirer.prompt([{
    message: message.charAt(0).toUpperCase() + message.slice(1),
    name: 'answer',
    type: 'confirm',
    default: defaultChoice,
  }]);

  return answer;
}

export async function input(message: string): Promise<string> {
  const { answer } = await inquirer.prompt([{
    message: message.charAt(0).toUpperCase() + message.slice(1),
    name: 'answer',
    type: 'input',
  }]);

  return answer;
}

export async function list<T>(choices: { name: string, value: T }[], message: string, defaultChoice?: T): Promise<T> {
  const { answer } = await inquirer.prompt([{
    choices,
    message: message.charAt(0).toUpperCase() + message.slice(1),
    name: 'answer',
    pageSize: 25,
    type: 'list',
    default: choices.find(choice => choice === defaultChoice),
  }]);

  return answer;
}

export function separtor(text: string) {
  return new inquirer.Separator(text);
}

export async function string(options: string[], message: string, defaultChoice?: string) {
  return list(options.map(o => ({ name: o, value: o })), message, defaultChoice);
}

export async function strings(options: string[], message: string, defaults?: string[]) {
  return checkbox(options.map(o => ({ name: o, value: o })), message, defaults);
}