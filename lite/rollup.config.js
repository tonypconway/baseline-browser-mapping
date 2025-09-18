import typescript from "@rollup/plugin-typescript";
import json from "@rollup/plugin-json";
import terser from "@rollup/plugin-terser";

export default [
  {
    input: "src/index.ts",
    output: {
      format: "es",
      dir: "dist",
    },
    plugins: [
      json(),
      typescript({
        tsconfig: "./tsconfig.json",
      }),
      // terser(),
    ],
  },
];
