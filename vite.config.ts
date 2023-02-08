import { defineConfig } from "vite";
import { nodePolyfills } from 'vite-plugin-node-polyfills'
import react from "@vitejs/plugin-react";
import viteTsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
    define: {
        "global": {},
        'process.env': {}
    },
    resolve: {
        alias: {
            process: "process/browser",
            buffer: "buffer",
            crypto: "crypto-browserify",
            stream: "stream-browserify",
            assert: "assert",
            http: "stream-http",
            https: "https-browserify",
            os: "os-browserify",
            url: "url",
            util: "util",
        },
    },
    plugins: [react(), viteTsconfigPaths(), nodePolyfills()],
});
