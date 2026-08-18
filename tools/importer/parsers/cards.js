/* eslint-disable */
/* global WebImporter */
/**
 * Parser for the `cards` block — "no images" variant.
 * Base block: cards (blocks/cards/cards.js).
 *
 * Contract (EDS Cards / Cards (no images)):
 *   Cards (no images) is a single-column table. The first row is the block name
 *   (`Cards (no images)`) and each subsequent row is one card whose single cell
 *   holds the card's text content — heading, description, and optional CTA.
 *   The sample cards have no image, so the no-images variant applies.
 */
export default function parse(element, { document }) {
  const cells = [];

  // Each direct child div of `.cards` is one authored card.
  const cards = element.querySelectorAll(':scope > div');
  cards.forEach((card) => {
    // Unwrap a single inner wrapper div if present, so we collect the real content.
    const source = (card.children.length === 1 && card.firstElementChild.tagName === 'DIV')
      ? card.firstElementChild
      : card;
    const content = Array.from(source.childNodes);
    cells.push([content]); // single cell → single-column "no images" row
  });

  // Empty-block guard: nothing to author.
  if (cells.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'Cards (no images)', cells });
  element.replaceWith(block);
}
