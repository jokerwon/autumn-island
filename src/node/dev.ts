import { createServer } from "vite";
import react from "@vitejs/plugin-react";
import pluginIndexHtml from "./plugin-island/indexHtml";

export function createDevServer(root: string) {
  return createServer({
    root,
    plugins: [pluginIndexHtml(), react()],
  });
}
