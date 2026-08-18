/* eslint-disable */
/* global WebImporter */

// PARSER IMPORTS
import cardsParser from './parsers/cards.js';

// PARSER REGISTRY
const parsers = {
  cards: cardsParser,
};

// PAGE TEMPLATE CONFIGURATION
const PAGE_TEMPLATE = {
  name: 'sample-page',
  description: 'Simple sample page: hero, intro text, a cards block, and a closing call-to-action.',
  urls: [
    'http://localhost:3000/drafts/sample-page',
  ],
  blocks: [
    {
      name: 'cards',
      instances: ['.cards'],
    },
  ],
};

/**
 * Find all blocks on the page based on the embedded template configuration.
 */
function findBlocksOnPage(document, template) {
  const pageBlocks = [];
  template.blocks.forEach((blockDef) => {
    blockDef.instances.forEach((selector) => {
      const elements = document.querySelectorAll(selector);
      if (elements.length === 0) {
        console.warn(`Block "${blockDef.name}" selector not found: ${selector}`);
      }
      elements.forEach((element) => {
        pageBlocks.push({ name: blockDef.name, selector, element });
      });
    });
  });
  console.log(`Found ${pageBlocks.length} block instances on page`);
  return pageBlocks;
}

// EXPORT DEFAULT CONFIGURATION
export default {
  transform: (payload) => {
    const { document, url, params } = payload;

    const main = document.querySelector('main') || document.body;

    // 1. Insert section breaks between the page's top-level content divs so the
    //    hero, intro, cards, and closing CTA become separate EDS sections.
    const topLevel = Array.from(main.children).filter((el) => el.tagName === 'DIV');
    topLevel.forEach((div, i) => {
      if (i === 0) return; // no leading break before the first section
      const hr = document.createElement('hr');
      div.before(hr);
    });

    // 2. Parse blocks on the page using registered parsers.
    const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);
    pageBlocks.forEach((block) => {
      if (!block.element.parentNode) return;
      const parser = parsers[block.name];
      if (parser) {
        try {
          parser(block.element, { document, url, params });
        } catch (e) {
          console.error(`Failed to parse ${block.name} (${block.selector}):`, e);
        }
      }
    });

    // 3. Apply WebImporter built-in rules.
    const hr = document.createElement('hr');
    main.appendChild(hr);
    WebImporter.rules.createMetadata(main, document);
    WebImporter.rules.transformBackgroundImages(main, document);
    WebImporter.rules.adjustImageUrls(main, url, params.originalURL);

    // 4. Force the output document path to the requested target.
    const path = '/sample-page';

    return [{
      element: main,
      path,
      report: {
        title: document.title || 'Sample Page',
        template: PAGE_TEMPLATE.name,
        blocks: pageBlocks.map((b) => b.name),
      },
    }];
  },
};
