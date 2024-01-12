import path from 'path';
import fs from 'fs-extra';
import { build as viteBuild, InlineConfig } from 'vite';
import { RollupOutput } from 'rollup';
import { SiteConfig } from 'shared/types';
import { CLIENT_ENTRY_PATH, SERVER_ENTRY_PATH } from './constants';
import { createVitePlugins } from './vitePlugins';

export async function bundle(root: string, config: SiteConfig) {
  const resovleViteConfig = (isServer: boolean): InlineConfig => {
    return {
      root,
      mode: 'production',
      plugins: createVitePlugins(config),
      ssr: {
        // 注意加上这个配置，防止 cjs 产物中 require ESM 的产物，因为 react-router-dom 的产物为 ESM 格式
        noExternal: ['react-router-dom']
      },
      build: {
        minify: false,
        ssr: isServer,
        outDir: isServer ? path.join(root, '.temp') : path.join(root, 'build'),
        rollupOptions: {
          input: isServer ? SERVER_ENTRY_PATH : CLIENT_ENTRY_PATH,
          output: {
            format: isServer ? 'cjs' : 'esm'
          }
        }
      }
    };
  };

  console.info('Building client & server bundles');
  try {
    const [clientBundle, serverBundle] = await Promise.all([
      // client build
      viteBuild(resovleViteConfig(false)),
      // server build
      viteBuild(resovleViteConfig(true))
    ]);
    return [clientBundle, serverBundle] as [RollupOutput, RollupOutput];
  } catch (e) {
    console.error(e);
  }
}

export async function renderPage(
  render: () => string,
  root: string,
  clientBundle: RollupOutput
) {
  const appHtml = render();
  const clientChunk = clientBundle.output.find(
    (chunk) => chunk.type === 'chunk' && chunk.isEntry
  );
  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta http-equiv="X-UA-Compatible" content="IE=edge">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>title</title>
    </head>
    <body>
      <div id="root">${appHtml}</div>
      <script src="/${clientChunk.fileName}" type="module"></script>
    </body> 
    </html>
  `.trim();
  await fs.ensureDir(path.join(root, 'build'));
  await fs.writeFile(path.join(root, 'build/index.html'), html);
  await fs.remove(path.join(root, '.temp'));
}

export async function build(root: string = process.cwd(), config: SiteConfig) {
  // 1. bundle - client & server
  const [clientBundle] = await bundle(root, config);
  // 2. 引入 server-entry
  const serverEntryPath = path.resolve(root, '.temp', 'ssr-entry.js');
  // 3. 服务端渲染，产出 HTML
  const { render } = await import(serverEntryPath);
  try {
    await renderPage(render, root, clientBundle);
  } catch (e) {
    console.log('Render page error.\n', e);
  }
}
