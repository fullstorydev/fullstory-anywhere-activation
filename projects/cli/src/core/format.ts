import { ux } from '@oclif/core';
import { StandardChalk } from '@oclif/core/lib/interfaces/theme.js';

export function bold(text: string) {
  return ux.colorize('bold', text);
}

export function box(text: string | string[], color: StandardChalk = 'bgBlue', uppercase = true) {
  return Array.isArray(text) ? text.map(line => ux.colorize(color, ux.colorize('bold', uppercase ? line.toUpperCase() : line))).join(' ') :
    ux.colorize(color, ux.colorize('bold', uppercase ? text.toUpperCase() : text));
}

export function cmd(text: string) {
  return ux.colorize('cyan', text);
}

export function constant(text?: string | string[], separator = ' ') {
  return text ? ux.colorize('cyan', Array.isArray(text) ? text.join(separator) : text) : '';
}

export function email(text: string) {
  // FullStory Support (name@fullstory.com)
  return text.startsWith('FullStory Support')
    ? highlight(text.slice(text.indexOf('(') + 1, -1))
    : text;
}

export function enabled(object?: any) {
  return object ? Object.keys(object).filter(key => object[key] === true).map(key => constant(key)) : [];
}

export function error(text: string) {
  return ux.colorize('red', text);
}

export function errorBox(text: string) {
  return ux.colorize('bgRedBright', ux.colorize('bold', text.toUpperCase()));
}

export function highlight(text: string) {
  return ux.colorize('magenta', text);
}

export function h1(text: string, divider = '----') {
  return ux.colorize('bold', `${divider} ${text.toUpperCase()} ${divider}`);
}

export function h2(text: string) {
  return ux.colorize('bold', text.toUpperCase());
}

export function h3(text: string) {
  return text.toUpperCase();
}

export function infoBox(text: string | string[], color: StandardChalk = 'bgBlue',) {
  return box(text, color);
}

export function id(text: string) {
  return ux.colorize('bold', text);
}

export function join(text?: string[], separator = ',', prefix = '', suffix = '') {
  return text ? text.sort().map(token => `${prefix}${token}${suffix}`).join(separator) : '';
}

export function number(text?: number | string, color: StandardChalk = 'blueBright',) {
  return text === undefined ? '' : ux.colorize(color, `${text}`);
}

export function success(text: string) {
  return ux.colorize('green', text);
}

export function successBox(text: string) {
  return ux.colorize('bgGreenBright', ux.colorize('bold', text.toUpperCase()));
}

export function text(text?: string | string[], empty = '-', separator = ' ') {
  return text ? Array.isArray(text) ? text.join(separator) : text : empty;
}

export function truthy(value?: boolean | string, text?: string) {
  return value ? (text || value) : '';
}

export function warn(text: string) {
  return ux.colorize('yellow', text);
}

export function warnBox(text: string) {
  return ux.colorize('bgYellowBright', ux.colorize('bold', text.toUpperCase()));
}