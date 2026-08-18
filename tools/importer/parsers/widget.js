/* eslint-disable */
/* global WebImporter */
/**
 * Parser for the `widget` block variant.
 * Base block: widget (bespoke local block — blocks/widget/widget.js).
 * Source: https://raegebogeverein.ch/test-seite-remo/ (WordPress/Enfold "newsbox" sidebar).
 * Generated: 2026-08-18
 *
 * Contract (blocks/widget/widget.js):
 *   The widget block expects a single `<a href>` whose href points to a dynamic
 *   fragment under `/widgets/{path}/{name}.html`. `decorate()` derives the widget
 *   name from the last path segment, fetches the fragment, and renders it.
 *
 * The source `section.newsbox` / `#newsbox-2` is a server-rendered WordPress sidebar
 * that lists upcoming events. Those `<li>` items are dynamic output and must NOT be
 * imported statically — they are replaced at runtime by the widget fragment. This
 * parser therefore emits a single-cell `widget` block linking to the `newsbox`
 * widget fragment rather than importing the individual event lines.
 */
export default function parse(element, { document }) {
  // Derive the widget name from the source section id / class.
  // `section#newsbox-2.newsbox` → widget name "newsbox".
  const sectionId = (element.id || '').trim();
  const classNames = Array.from(element.classList || []);
  // Prefer a stable, non-Enfold-utility class as the widget identity.
  const ignore = new Set(['widget', 'clearfix', 'avia-widget-container']);
  const identityClass = classNames.find((c) => !ignore.has(c));
  // Strip trailing WordPress instance suffix (e.g. "newsbox-2" → "newsbox").
  const fromId = sectionId.replace(/-\d+$/, '');
  const widgetName = identityClass || fromId || 'newsbox';

  // Build the fragment anchor per the widget block contract. `decorate()` reads the
  // FIRST `a[href]` in the block, so this must lead the cell.
  const link = document.createElement('a');
  link.href = `/widgets/${widgetName}.html`;
  link.textContent = widgetName;

  // Empty-block guard: without a resolvable widget name there is nothing to load.
  if (!widgetName) {
    element.replaceWith(...element.childNodes);
    return;
  }

  // Preserve the source event entries so the imported content is not lost.
  // At runtime `decorate()` replaces this with the dynamic widget fragment, but the
  // static snapshot keeps the authored content complete for the migration record.
  const contentCell = [link];
  const items = element.querySelectorAll('li.news-content, .news-wrap > li, li');
  items.forEach((li) => {
    // The headline link carries the date + title text (the empty `.news-thumb`
    // anchor precedes it in the DOM, so select `.news-title` explicitly).
    const titleLink = li.querySelector('a.news-title')
      || li.querySelector('.news-headline a[href]')
      || Array.from(li.querySelectorAll('a[href]')).find((a) => (a.textContent || '').trim());
    if (titleLink && (titleLink.textContent || '').trim()) {
      const p = document.createElement('p');
      p.append(titleLink);
      contentCell.push(p);
    }
  });

  // Single-column block: one row, one cell holding the fragment anchor + entries.
  const cells = [];
  cells.push([contentCell]);

  const block = WebImporter.Blocks.createBlock(document, { name: 'widget', cells });
  element.replaceWith(block);
}
