/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: raegebogeverein (WordPress/Enfold) site-wide cleanup.
 * All selectors verified against migration-work/cleaned.html.
 */

const TransformHook = { beforeTransform: 'beforeTransform', afterTransform: 'afterTransform' };

export default function transform(hookName, element, payload) {
  if (hookName === TransformHook.beforeTransform) {
    // Overlays / widgets / non-authorable chrome that could interfere with parsing.
    // Found in cleaned.html:
    //   .av-siteloader-wrap        -> full-page preloader overlay
    //   .avia-cookie-consent-wrap  -> cookie bar + #av-consent-extra-info settings modal
    //   #fb-root                   -> Facebook SDK root
    //   #scroll-top-link           -> "scroll to top" widget
    WebImporter.DOMUtils.remove(element, [
      '.av-siteloader-wrap',
      '.avia-cookie-consent-wrap',
      '#fb-root',
      '#scroll-top-link',
    ]);
  }

  if (hookName === TransformHook.afterTransform) {
    // Global site shell / non-authorable content. Found in cleaned.html:
    //   header#header                         -> global header + main navigation
    //   .breadcrumb.breadcrumbs.avia-breadcrumbs -> auto-generated breadcrumb in title bar
    //   #footer                               -> footer widget area (global/auto-populated)
    //   footer#socket                         -> copyright / social socket (global)
    WebImporter.DOMUtils.remove(element, [
      'header#header',
      '.breadcrumb.breadcrumbs.avia-breadcrumbs',
      '#footer',
      'footer#socket',
    ]);
  }
}
