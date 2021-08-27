import { spawnSync } from "child_process";
import { readFileSync, writeFileSync } from "fs";
import { resolve } from "path";
import test from "tape";

const updatePackage = (values: { engines?: { node?: string } }): void => {
  const content = JSON.parse(
    readFileSync(resolve(__dirname, "../package.json"), "utf-8")
  );
  delete content.engines;
  Object.assign(content, values);
  writeFileSync(
    resolve(__dirname, "../package.json"),
    JSON.stringify(content, undefined, "  ")
  );
};

const install = (): { stdout: string; status: number } => {
  return spawnSync("yarn", {
    cwd: resolve(__dirname, ".."),
    encoding: "utf-8",
  });
};

test("errors out when Node version does not satisfy engines.node", (t) => {
  t.plan(2);

  updatePackage({ engines: { node: ">= 42" } });
  const { stdout: output, status: exitCode } = install();

  t.equal(exitCode, 1);
  t.match(
    output,
    new RegExp(
      "^" +
        [
          "➤ YN0000: ┌ Project validation",
          "➤ YN0000: │ The current node version v14.17.3 does not satisfy the required version >= 42.",
          "➤ YN0000: └ Completed",
          "➤ YN0000: Failed with errors",
        ].join("\n")
    )
  );
});

test("does nothing when Node version satisfies engines.node", (t) => {
  t.plan(2);

  updatePackage({ engines: { node: ">= 10" } });
  const { stdout: output, status: exitCode } = install();

  t.equal(exitCode, 0);
  t.match(output, new RegExp("^➤ YN0000: ┌ Resolution step"));
});

test("does nothing when engines is not present", (t) => {
  t.plan(2);

  updatePackage({});
  const { stdout: output, status: exitCode } = install();

  t.equal(exitCode, 0);
  t.match(output, new RegExp("^➤ YN0000: ┌ Resolution step"));
});