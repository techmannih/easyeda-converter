import { test } from "bun:test"
import { convertEasyEdaJsonToCircuitJson } from "lib"
import { EasyEdaJsonSchema } from "lib/schemas/easy-eda-json-schema"
import { su } from "@tscircuit/soup-util"
import c19795120 from "../assets/C19795120.raweasy.json"

test("C19795120 cad component snapshot", () => {
  const easy = EasyEdaJsonSchema.parse(c19795120)
  const circuit = convertEasyEdaJsonToCircuitJson(easy)
  const cad = su(circuit).cad_component.list()[0]
  expect(cad).toMatchCadSnapshot(import.meta.path)
})
