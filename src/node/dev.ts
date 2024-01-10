import { createServer } from 'vite';
import react from '@vitejs/plugin-react';
import pluginIndexHtml from './plugin-island/indexHtml';
import { pluginConfig } from './plugin-island/config';
import { PACKAGE_ROOT } from './constants';
import { resolveConfig } from './config';

export async function createDevServer(
  root: string,
  restartServer: () => Promise<void>
) {
  const config = await resolveConfig(root, 'serve', 'development');

  return createServer({
    root,
    plugins: [pluginIndexHtml(), react(), pluginConfig(config, restartServer)],
    server: {
      fs: {
        allow: [PACKAGE_ROOT]
      }
    }
  });
}
