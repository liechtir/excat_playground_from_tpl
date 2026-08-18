/* eslint-disable */
var CustomImportScript = (() => {
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // tools/importer/import-sample-page.js
  var import_sample_page_exports = {};
  __export(import_sample_page_exports, {
    default: () => import_sample_page_default
  });

  // tools/importer/parsers/cards.js
  function parse(element, { document }) {
    const cells = [];
    const cards = element.querySelectorAll(":scope > div");
    cards.forEach((card) => {
      const source = card.children.length === 1 && card.firstElementChild.tagName === "DIV" ? card.firstElementChild : card;
      const content = Array.from(source.childNodes);
      cells.push([content]);
    });
    if (cells.length === 0) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document, { name: "Cards (no images)", cells });
    element.replaceWith(block);
  }

  // tools/importer/import-sample-page.js
  var parsers = {
    cards: parse
  };
  var PAGE_TEMPLATE = {
    name: "sample-page",
    description: "Simple sample page: hero, intro text, a cards block, and a closing call-to-action.",
    urls: [
      "http://localhost:3000/drafts/sample-page"
    ],
    blocks: [
      {
        name: "cards",
        instances: [".cards"]
      }
    ]
  };
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
  var import_sample_page_default = {
    transform: (payload) => {
      const { document, url, params } = payload;
      const main = document.querySelector("main") || document.body;
      const topLevel = Array.from(main.children).filter((el) => el.tagName === "DIV");
      topLevel.forEach((div, i) => {
        if (i === 0) return;
        const hr2 = document.createElement("hr");
        div.before(hr2);
      });
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
      const hr = document.createElement("hr");
      main.appendChild(hr);
      WebImporter.rules.createMetadata(main, document);
      WebImporter.rules.transformBackgroundImages(main, document);
      WebImporter.rules.adjustImageUrls(main, url, params.originalURL);
      const path = "/sample-page";
      return [{
        element: main,
        path,
        report: {
          title: document.title || "Sample Page",
          template: PAGE_TEMPLATE.name,
          blocks: pageBlocks.map((b) => b.name)
        }
      }];
    }
  };
  return __toCommonJS(import_sample_page_exports);
})();
