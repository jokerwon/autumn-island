import { Plugin } from 'vite';
import { pluginMdxRollup } from './pluginMdxRollup';

export function pluginMdx(): Promise<Plugin>[] {
  return [pluginMdxRollup()];
}
