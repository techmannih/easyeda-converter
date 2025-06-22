import { expect } from "bun:test"
import fs from "fs"
import path from "path"

interface CadMatchers<R> {
  toMatchCadSnapshot(snapshotPath: string): R
}

declare module "bun:test" {
  interface Matchers<R> extends CadMatchers<R> {}
}

expect.extend({
  toMatchCadSnapshot(received: unknown, snapshotPath: string) {
    if (typeof snapshotPath !== "string") {
      throw new Error("snapshotPath must be a string")
    }
    const dir = path.join(path.dirname(snapshotPath), "__snapshots__")
    const base = path.basename(snapshotPath).replace(/\.test\.[tj]s$/, ".snap.json")
    const snapFile = path.join(dir, base)
    const value = typeof received === "string" ? received : JSON.stringify(received, null, 2)
    if (!fs.existsSync(snapFile)) {
      fs.mkdirSync(dir, { recursive: true })
      fs.writeFileSync(snapFile, value)
      return {
        pass: true,
        message: () => `New snapshot written to ${snapFile}`,
      }
    }
    const expected = fs.readFileSync(snapFile, "utf8")
    const pass = expected === value
    if (!pass) {
      fs.writeFileSync(snapFile, value)
    }
    return {
      pass,
      message: () => (pass ? "Snapshot matched" : `Snapshot mismatch: ${snapFile}`),
    }
  },
})
