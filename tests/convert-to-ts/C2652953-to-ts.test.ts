import { it, expect } from "bun:test"
import chipRawEasy from "../assets/C2652953.raweasy.json"
import { convertBetterEasyToTsx } from "lib/websafe/convert-to-typescript-component"
import { EasyEdaJsonSchema } from "lib/schemas/easy-eda-json-schema"
import { runTscircuitCode } from "tscircuit"
import { wrapTsxWithBoardFor3dSnapshot } from "../fixtures/wrap-tsx-with-board-for-3d-snapshot"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"

it("should convert C2652953 into typescript file", async () => {
  const betterEasy = EasyEdaJsonSchema.parse(chipRawEasy)
  const result = await convertBetterEasyToTsx({
    betterEasy,
  })

  expect(result).not.toContain("milmm")
  expect(result).not.toContain("NaNmm")

  const circuitJson = await runTscircuitCode(`
    ${result}
    export default () => (
      <board width="10mm" height="10mm">
        <TXS0104EQPWRQ1 name="U_LC1" />
      </board>
    )
  `)

  expect(result).not.toContain("milmm")
  expect(result).not.toContain("NaNmm")
  expect(result).toMatchInlineSnapshot(`
    "import type { ChipProps } from \"@tscircuit/props\"

    const pinLabels = {
      pin1: [\"pin1\"]
    } as const

    export const TXS0104EQPWRQ1 = (props: ChipProps<typeof pinLabels>) => {
      return (
        <chip
          pinLabels={pinLabels}
          supplierPartNumbers={{
      \"jlcpcb\": [
        \"C2652953\"
      ]
    }}
          manufacturerPartNumber=\"TXS0104EQPWRQ1\"
          footprint={<footprint>
            <smtpad portHints={[\"pin1\"]} pcbX=\"0mm\" pcbY=\"0mm\" width=\"25.4mm\" height=\"12.7mm\" shape=\"rect\" />
    <silkscreentext text={props.name} pcbX=\"25.4mm\" pcbY=\"-25.4mm\" anchorAlignment=\"center\" fontSize=\"2.54mm\" />
    <courtyardoutline outline={[{\"x\":-0.25,\"y\":0.25},{\"x\":254.25,\"y\":0.25},{\"x\":254.25,\"y\":-254.25},{\"x\":-0.25,\"y\":-254.25},{\"x\":-0.25,\"y\":0.25}]} />
          </footprint>}
          
          {...props}
        />
      )
    }"
  `)
  await expect(circuitJson).toMatch3dSnapshot(import.meta.path)

  const pcbSvg = convertCircuitJsonToPcbSvg(circuitJson)
  expect(pcbSvg).toMatchSvgSnapshot(import.meta.path)
}, 20000)
