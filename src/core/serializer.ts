/**
 * HTML serializer with XSS protection
 */

import type { VNode } from './types.js';

/**
 * Serialize VNode tree to HTML with full XSS protection
 */
export function serializeVNode(node: VNode): string {
  // Document fragment - serialize children only
  if (node.tag === '#document-fragment' || node.tag === '#document') {
    return node.children.map(serializeVNode).join('');
  }

  // Text node - escape all HTML entities
  if (node.tag === '#text') {
    return escapeHtml(node.attrs.value || '');
  }

  // Comment node - remove by default for security
  if (node.tag === '#comment') {
    return '';
  }

  // Dangerous tags - completely remove (including content)
  if (isDangerousTag(node.tag)) {
    return '';
  }

  // Check for dangerous attributes
  const safeAttrs = sanitizeAttributes(node.tag, node.attrs);
  const attrStr = serializeAttributes(safeAttrs);

  // Self-closing tags
  if (isSelfClosing(node.tag)) {
    return `<${node.tag}${attrStr}/>`;
  }

  // Regular element
  const childrenStr = node.children.map(serializeVNode).join('');
  return `<${node.tag}${attrStr}>${childrenStr}</${node.tag}>`;
}

/**
 * Check if tag is potentially dangerous
 */
function isDangerousTag(tag: string): boolean {
  const dangerousTags = [
    'script', 'style', 'iframe', 'frame', 'frameset',
    'object', 'embed', 'applet', 'meta', 'link',
    'base', 'form', 'input', 'button', 'select', 'textarea'
  ];
  return dangerousTags.includes(tag.toLowerCase());
}

/**
 * Sanitize attributes - remove dangerous ones
 */
function sanitizeAttributes(tag: string, attrs: Record<string, string>): Record<string, string> {
  const safeAttrs: Record<string, string> = {};

  for (const [name, value] of Object.entries(attrs)) {
    const lowerName = name.toLowerCase();

    // Skip event handlers (onclick, onerror, onload, etc.)
    if (lowerName.startsWith('on')) {
      continue;
    }

    // Skip javascript: URIs
    if ((lowerName === 'href' || lowerName === 'src' || lowerName === 'action') &&
        value.toLowerCase().includes('javascript:')) {
      continue;
    }

    // Skip data: URIs in certain contexts
    if ((lowerName === 'src' || lowerName === 'href') &&
        value.toLowerCase().startsWith('data:')) {
      continue;
    }

    // Keep safe attributes
    safeAttrs[name] = value;
  }

  return safeAttrs;
}

/**
 * Serialize attributes to string
 */
function serializeAttributes(attrs: Record<string, string>): string {
  const entries = Object.entries(attrs);
  if (entries.length === 0) return '';

  return ' ' + entries
    .map(([name, value]) => `${name}="${escapeHtml(value)}"`)
    .join(' ');
}

/**
 * Check if tag is self-closing
 */
function isSelfClosing(tag: string): boolean {
  const selfClosingTags = new Set([
    'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input',
    'link', 'meta', 'param', 'source', 'track', 'wbr'
  ]);
  return selfClosingTags.has(tag.toLowerCase());
}

/**
 * Escape HTML special characters
 */
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}