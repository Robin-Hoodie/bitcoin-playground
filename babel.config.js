const tsconfig = require("./tsconfig.json");

// Convert path notation from tsconfig.json to path notation of babel-plugin-module-resolver
const alias = Object.entries(tsconfig.compilerOptions.paths).reduce(
  (alias, [key, value]) => {
    alias[key.replace("/*", "")] = value[0].replace("/*", "");
    return alias;
  },
  {}
);

module.exports = {
  presets: [
    ["@babel/preset-env", { targets: { node: "current" } }],
    "@babel/preset-typescript",
  ],
  plugins: [
    [
      "module-resolver",
      {
        alias,
      },
    ],
  ],
};
