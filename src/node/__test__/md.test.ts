import { unified } from 'unified';
import { describe, test, expect } from 'vitest';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import rehypeStringify from 'rehype-stringify';
import { getHighlighter } from 'shiki';
import { rehypePluginPreWrapper } from '../plugin-mdx/rehypePlugins/preWrapper';
import { rehypePluginShiki } from '../plugin-mdx/rehypePlugins/shiki';

describe('Markdown compile cases', async () => {
  // 初始化 processor
  const processor = unified()
    .use(remarkParse)
    .use(remarkRehype)
    .use(rehypePluginPreWrapper)
    .use(rehypeStringify)
    .use(rehypePluginShiki, {
      highlighter: await getHighlighter({
        themes: [import('shiki/themes/nord.mjs')],
        langs: [import('shiki/langs/javascript.mjs')]
      })
    });

  test('Compile title', async () => {
    const mdContent = '# 123';
    const result = processor.processSync(mdContent);
    expect(result.value).toMatchInlineSnapshot('"<h1>123</h1>"');
  });

  test('Compile code', async () => {
    const mdContent = 'I am using `Island.js`';
    const result = processor.processSync(mdContent);
    expect(result.value).toMatchInlineSnapshot(
      '"<p>I am using <code>Island.js</code></p>"'
    );
  });

  test('Compile code block', async () => {
    const mdContent = '```js\nconsole.log(123);\n```';
    const result = processor.processSync(mdContent);
    expect(result.value).toMatchInlineSnapshot(`
      "<div class=\\"language-js\\"><span class=\\"lang\\">js</span><pre class=\\"shiki nord\\" style=\\"background-color:#2e3440ff;color:#d8dee9ff\\" tabindex=\\"0\\"><code><span class=\\"line\\"><span style=\\"color:#D8DEE9\\">console</span><span style=\\"color:#ECEFF4\\">.</span><span style=\\"color:#88C0D0\\">log</span><span style=\\"color:#D8DEE9FF\\">(</span><span style=\\"color:#B48EAD\\">123</span><span style=\\"color:#D8DEE9FF\\">)</span><span style=\\"color:#81A1C1\\">;</span></span>
      <span class=\\"line\\"></span></code></pre></div>"
    `);
  });
});
