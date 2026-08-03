// Runs the *.check.ts harnesses in this directory, which are deliberately not
// part of the project's test suite: they write artifacts rather than assert.
// Kept here beside them so no production config has to know they exist.

import { fileURLToPath } from "node:url";

import { defineConfig } from "vitest/config";

export default defineConfig({
  root: fileURLToPath(new URL("../../../../", import.meta.url)),
  test: {
    environment: "jsdom",
    include: ["agents-working-files/.scratch/diagram-model/verification/*.check.ts"],
  },
});
