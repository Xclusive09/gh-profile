import { describe, test, expect } from 'vitest';
import { resolvePluginState } from '../src/plugins/resolve.js';

describe('resolvePluginState', () => {
  const all = ['a', 'b', 'c', 'd'];

  test('defaults: all enabled', () => {
    const res = resolvePluginState({ allPluginIds: all });
    expect(res.enabled.sort()).toEqual(all);
    expect(res.disabled).toEqual([]);
  });

  test('config disables', () => {
    const res = resolvePluginState({ allPluginIds: all, config: { b: false } });
    expect(res.enabled.sort()).toEqual(['a', 'c', 'd']);
    expect(res.disabled).toEqual(['b']);
  });

  test('config enables', () => {
    const res = resolvePluginState({ allPluginIds: all, config: { b: true } });
    expect(res.enabled.sort()).toEqual(all);
    expect(res.disabled).toEqual([]);
  });

  test('cli disables override config', () => {
    const res = resolvePluginState({ allPluginIds: all, cliDisable: ['c'], config: { c: true } });
    expect(res.enabled.sort()).toEqual(['a', 'b', 'd']);
    expect(res.disabled).toEqual(['c']);
  });

  test('cli enables override config disables', () => {
    const res = resolvePluginState({ allPluginIds: all, cliEnable: ['b'], config: { b: false } });
    expect(res.enabled.sort()).toEqual(all);
    expect(res.disabled).toEqual([]);
  });

  test('explicit disables always win', () => {
    const res = resolvePluginState({ allPluginIds: all, cliDisable: ['a', 'b'], cliEnable: ['a', 'b'], config: { a: true, b: true } });
    expect(res.enabled.sort()).toEqual(['c', 'd']);
    expect(res.disabled.sort()).toEqual(['a', 'b']);
  });
});
