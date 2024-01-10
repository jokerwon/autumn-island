import { createServer } from 'vite';
import react from '@vitejs/plugin-react';
import pluginIndexHtml from './plugin-island/indexHtml';
import { PACKAGE_ROOT } from './constants';

export function createDevServer(root: string) {
  return createServer({
    root,
    plugins: [pluginIndexHtml(), react()],
    server: {
      fs: {
        allow: [PACKAGE_ROOT]
      }
    }
  });
}
