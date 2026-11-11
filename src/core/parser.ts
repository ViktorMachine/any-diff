/**
 * HTML parser - parse5 to VNode conversion
 */

import { parse, parseFragment } from 'parse5';
import type { VNode } from './types.js';

/**
 * Parse HTML string to VNode tree
 * @param html - HTML string to parse
 * @param isFragment - Whether to parse as fragment (default: true)
 * @returns VNode tree root
 */
export function parseHtml(html: string, isFragment = true): VNode {
  const document = isFragment
    ? parseFragment(html)
    : parse(html);

  return convertNode(document, '');
}

/**
 * Convert parse5 node to VNode
 */
function convertNode(node: any, parentPath: string): VNode {
  const path = parentPath;
  const tag = getTagName(node);

  // Text node
  if (tag === '#text') {
    return {
      tag: '#text',
      attrs: { value: node.value || '' },
      children: [],
      path,
    };
  }

  // Comment node
  if (tag === '#comment') {
    return {
      tag: '#comment',
      attrs: { value: node.data || '' },
      children: [],
      path,
    };
  }

  // Document node
  if (tag === '#document' || tag === '#document-fragment') {
    const children = (node.childNodes || []).map((child: any, index: number) =>
      convertNode(child, `${path}/${index}`)
    );
    return {
      tag,
      attrs: {},
      children,
      path,
    };
  }

  // Element node
  const attrs: Record<string, string> = {};
  if (node.attrs) {
    for (const attr of node.attrs) {
      attrs[attr.name] = attr.value;
    }
  }

  const children = (node.childNodes || []).map((child: any, index: number) =>
    convertNode(child, `${path}/${index}`)
  );

  return {
    tag,
    attrs,
    children,
    path,
  };
}

/**
 * Get tag name from parse5 node
 */
function getTagName(node: any): string {
  if (node.nodeName) {
    return node.nodeName;
  }
  if (node.tagName) {
    return node.tagName;
  }
  return '#unknown';
}