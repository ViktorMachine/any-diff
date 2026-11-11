/**
 * Normalization pipeline for VNode trees
 */

import type { VNode } from './types.js';

/**
 * Normalizer transform function type
 */
export type NormalizerTransform = (node: VNode) => VNode;

/**
 * Normalize whitespace in text nodes
 */
export function normalizeWhitespace(node: VNode): VNode {
  if (node.tag === '#text') {
    const value = node.attrs.value || '';
    // Collapse multiple spaces into single space
    const normalized = value.replace(/\s+/g, ' ');
    return {
      ...node,
      attrs: { ...node.attrs, value: normalized },
    };
  }

  if (node.children.length > 0) {
    return {
      ...node,
      children: node.children.map(normalizeWhitespace),
    };
  }

  return node;
}

/**
 * Normalize &nbsp; to regular space
 */
export function normalizeNbsp(node: VNode): VNode {
  if (node.tag === '#text') {
    const value = node.attrs.value || '';
    const normalized = value.replace(/ /g, ' ');
    return {
      ...node,
      attrs: { ...node.attrs, value: normalized },
    };
  }

  if (node.children.length > 0) {
    return {
      ...node,
      children: node.children.map(normalizeNbsp),
    };
  }

  return node;
}

/**
 * Sort class attribute alphabetically
 */
export function sortClasses(node: VNode): VNode {
  if (node.attrs.class) {
    const classes = node.attrs.class.split(/\s+/).filter(Boolean);
    const sorted = classes.sort().join(' ');
    return {
      ...node,
      attrs: { ...node.attrs, class: sorted },
    };
  }

  if (node.children.length > 0) {
    return {
      ...node,
      children: node.children.map(sortClasses),
    };
  }

  return node;
}

/**
 * Remove empty wrapper elements (no attrs, no content)
 */
export function removeEmptyWrappers(node: VNode): VNode {
  // Don't remove text nodes or comments
  if (node.tag.startsWith('#')) {
    return node;
  }

  // Process children first
  const children = node.children
    .map(removeEmptyWrappers)
    .filter((child) => {
      // Keep text nodes with content
      if (child.tag === '#text' && child.attrs.value?.trim()) {
        return true;
      }
      // Keep non-empty elements
      if (!child.tag.startsWith('#') && (child.children.length > 0 || Object.keys(child.attrs).length > 0)) {
        return true;
      }
      return false;
    });

  // Return node with filtered children
  return {
    ...node,
    children,
  };
}

/**
 * Create normalization pipeline
 */
export function createNormalizer(transforms: NormalizerTransform[]): (node: VNode) => VNode {
  return (node: VNode) => transforms.reduce((acc, transform) => transform(acc), node);
}

/**
 * Default semantic normalizer
 */
export const semanticNormalizer = createNormalizer([
  normalizeWhitespace,
  normalizeNbsp,
  sortClasses,
]);

/**
 * Strict normalizer (minimal)
 */
export const strictNormalizer = createNormalizer([
  normalizeWhitespace,
]);