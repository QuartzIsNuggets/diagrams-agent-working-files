// Ticket 04's real-renderer check: build a canvas through the production
// modules, export it, and write the file out for an SVG renderer to open.
// Not part of the test suite — see README.md for how to run it.

import { writeFileSync } from "node:fs";
import { expect, it, vi } from "vitest";

import { createCanvas, enablePlopping } from "../../../../src/canvas";
import { serializeCanvas } from "../../../../src/export-svg";
import { createLabelForm, enableLabelPlacing } from "../../../../src/mathjax-label";

// Written next to this file. Vitest is run from the project root (see README).
const OUT = "agents-working-files/.scratch/plop-and-export/verification/diagram.svg";

const DOTS = [
  [120, 300],
  [200, 340],
  [300, 300],
  [420, 380],
  [520, 300],
];

const LABELS = [
  "\\Sigma_{(x:A)} P(x)",
  "\\int_0^\\infty e^{-x^2}\\,dx = \\frac{\\sqrt{\\pi}}{2}",
  "f : \\mathbb{N} \\to \\mathbb{R}",
];

it("exports a canvas of dots and typeset labels to diagram.svg", async () => {
  const canvas = createCanvas();
  enablePlopping(canvas);
  // jsdom has no layout, so the canvas is given the size a browser would.
  canvas.getBoundingClientRect = (): DOMRect => new DOMRect(0, 0, 800, 460);
  document.body.append(canvas);

  const form = createLabelForm();
  enableLabelPlacing(canvas, form);
  document.body.append(form);

  for (const [x, y] of DOTS) {
    canvas.dispatchEvent(new PointerEvent("pointerdown", { clientX: x, clientY: y, button: 0 }));
    canvas.dispatchEvent(new PointerEvent("pointerup", { clientX: x, clientY: y, button: 0 }));
  }
  expect(canvas.querySelectorAll("circle")).toHaveLength(DOTS.length);

  for (const latex of LABELS) {
    form.querySelector("input")!.value = latex;
    form.querySelector<HTMLButtonElement>("button[type=submit]")!.click();
    await vi.waitFor(() => {
      expect(form.querySelector(".label-error")?.textContent).toBe("");
    });
  }
  await vi.waitFor(() => {
    expect(canvas.querySelectorAll("g.math-label")).toHaveLength(LABELS.length);
  });

  writeFileSync(OUT, serializeCanvas(canvas));
}, 60000);
