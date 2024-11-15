// @ts-nocheck
import { execSync } from "child_process";
import crypto from "crypto";
import * as esbuild from "esbuild";
import globalPlugin from "esbuild-plugin-globals";
import path from "path";
import { fileURLToPath } from "url";
import yargs from "yargs-parser";

import { printBuildSuccess } from "./util.mjs";

/** @type string[] */
const metroDeps = await (async () => {
    const ast = await esbuild.build({
        entryPoints: ["./shims/depsModule.ts"],
        write: false,
        bundle: true,
        format: "esm",
    });
    return ast.outputFiles[0].text.match(/(?<=require$"!bunny-deps-shim!"$\[")[^"]+/g);
})();

const args = yargs(process.argv.slice(2));
const {
    "release-branch": releaseBranch,
    "build-minify": buildMinify,
    "dev": dev
} = args;

let context = null;

const config = {
    entryPoints: ["src/entry.ts"],
    bundle: true,
    outfile: "dist/revenge.js",
    format: "iife",
    splitting: false,
    external: [],
    loader: {
        ".png": "dataurl"
    },
    define: {
        __DEV__: dev ?? JSON.stringify(releaseBranch !== "main")
    },
    inject: ["./shims/asyncIteratorSymbol.js", "./shims/promiseAllSettled.js"],
    legalComments: "none",
    alias: {
        "!bunny-deps-shim!": "./shims/depsModule.ts",
        "spitroast": "./node_modules/spitroast",
        "react/jsx-runtime": "./shims/jsxRuntime"
    },
    plugins: [
        globalPlugin({
            ...metroDeps.reduce((obj, key) => {
                obj[key] = `require("!bunny-deps-shim!")[${JSON.stringify(key)}]`;
                return obj;
            }, {})
        }),
        {
            name: "typescript",
            setup(build) {
                build.onLoad({ filter: /\.tsx?$/ }, async args => {
                    const result = await esbuild.transform(await fs.promises.readFile(args.path, 'utf8'), {
                        loader: 'tsx',
                        target: 'esnext',
                        jsx: 'automatic',
                    });
                    return { contents: result.code };
                });
            }
        }
    ]
};

export async function buildBundle(overrideConfig = {}) {
    context = {
        hash: releaseBranch ? execSync("git rev-parse --short HEAD").toString().trim() : crypto.randomBytes(8).toString("hex").slice(0, 7)
    };

    const initialStartTime = performance.now();
    await build({ ...config, ...overrideConfig });

    return {
        config,
        context,
        timeTook: performance.now() - initialStartTime
    };
}

const pathToThisFile = path.resolve(fileURLToPath(import.meta.url));
const pathPassedToNode = path.resolve(process.argv[1]);
const isThisFileBeingRunViaCLI = pathToThisFile.includes(pathPassedToNode);

if (isThisFileBeingRunViaCLI) {
    const { timeTook } = await buildBundle();

    printBuildSuccess(
        context.hash,
        releaseBranch,
        timeTook
    );

    if (buildMinify) {
        const { timeTook } = await buildBundle({
            minify: true,
            outfile: config.outfile.replace(/\.js$/, ".min.js")
        });

        printBuildSuccess(
            context.hash,
            releaseBranch,
            timeTook,
            true
        );
    }
}

