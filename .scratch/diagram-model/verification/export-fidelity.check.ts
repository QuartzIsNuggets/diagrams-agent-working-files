// Ticket 06's real-renderer check: build a *diagram* through the production
// modules, export it, and write the file out for an SVG renderer to open. No
// canvas is made and nothing is laid out — the file is one the screen never
// drew, which is half of what is being checked.
// Not part of the test suite — see export-fidelity.md for how to run it.

import { writeFileSync } from "node:fs";
import { expect, it } from "vitest";

import type { Diagram, DotSide, Point } from "../../../../src/diagram";
import { addBox, addDot, EMPTY_DIAGRAM, labelDot } from "../../../../src/diagram";
import { serializeDiagram } from "../../../../src/export-svg";

// Written next to this file. Vitest is run from the project root (see the doc).
const OUT = "agents-working-files/.scratch/diagram-model/verification/diagram.svg";

/** Two boxes, so the file has to frame more than one mark. */
const BOXES = [
  { source: "\\Sigma_{(x:A)} P(x)", x: 200, y: -160, w: 320, h: 220 },
  { source: "f : \\mathbb{N} \\to \\mathbb{R}", x: 620, y: -260, w: 300, h: 180 },
];

/**
 * A dot in each box, on each of the four sides a label may take.
 *
 * `x_0` sits against its box's left wall, so its label reaches past it: what a
 * renderer draws there is the frame's own claim, the file being framed by the
 * ink rather than by the extents the model holds.
 */
const DOTS: readonly (Point & { source: string; side: DotSide })[] = [
  { x: 120, y: -110, source: "a", side: "above" },
  { x: 250, y: -110, source: "\\frac{\\sqrt{\\pi}}{2}", side: "below" },
  { x: 60, y: -210, source: "x_0", side: "left" },
  { x: 560, y: -260, source: "\\int_0^\\infty e^{-x^2}\\,dx", side: "right" },
];

/** Place `at` and name it, or fail saying what the model refused. */
function named(diagram: Diagram, at: Point, source: string, side: DotSide): Diagram {
  const placed = addDot(diagram, at);
  if (typeof placed !== "string") {
    const labelled = labelDot(placed.diagram, placed.dot, source);
    // `above` is what the model gives a new label; the other three are written
    // in here, no gesture putting a label on one of them yet.
    return {
      ...labelled,
      dots: labelled.dots.map((one) => (one.id === placed.dot ? { ...one, labelSide: side } : one)),
    };
  }
  throw new Error(`the diagram refused a dot at (${String(at.x)}, ${String(at.y)}): ${placed}`);
}

it("exports a diagram of boxes, dots and typeset labels to diagram.svg", async () => {
  const built = DOTS.reduce<Diagram>(
    (sofar, { source, side, ...at }) => named(sofar, at, source, side),
    BOXES.reduce<Diagram>((sofar, box) => addBox(sofar, box), EMPTY_DIAGRAM),
  );

  // Handed over exactly as the model holds it: the export sets its own labels,
  // so this harness owes the diagram nothing before asking for a file — which
  // is the other half of what is being checked, a diagram no gesture built
  // still coming out named.
  const file = await serializeDiagram(built);

  // Asserted before it is written, because an export names no source it could
  // not set: one this fixture got wrong would otherwise reach the artifact as a
  // mark quietly missing its label, for a human to notice or not.
  expect(file.match(/<g class="box-label"/gu)).toHaveLength(BOXES.length);
  expect(file.match(/<g class="dot-label"/gu)).toHaveLength(DOTS.length);

  writeFileSync(OUT, file);
}, 60000);
