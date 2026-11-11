/**
 * Tree matching algorithm
 * Matches nodes between old and new VNode trees using heuristics
 */

import type { VNode } from './types.js';

/**
 * Match result - pair of matched nodes
 */
export interface NodeMatch {
  oldNode: VNode | null;
  newNode: VNode | null;
  type: 'match' | 'add' | 'del';
}

/**
 * Matching weights configuration
 */
export interface MatchWeights {
  /** Weight for tag match (must match) */
  tag: number;
  /** Weight for key attribute match */
  key: number;
  /** Weight for text content similarity */
  text: number;
  /** Weight for attributes overlap */
  attrs: number;
}

const DEFAULT_WEIGHTS: MatchWeights = {
  tag: 100,
  key: 50,
  text: 30,
  attrs: 20,
};

/**
 * Calculate similarity score between two nodes
 */
export function calculateSimilarity(
  oldNode: VNode,
  newNode: VNode,
  weights: MatchWeights = DEFAULT_WEIGHTS
): number {
  // Tag must match
  if (oldNode.tag !== newNode.tag) {
    return -1;
  }

  let score = weights.tag;

  // Key attribute match
  if (oldNode.attrs.key && newNode.attrs.key) {
    if (oldNode.attrs.key === newNode.attrs.key) {
      score += weights.key;
    } else {
      score -= weights.key;
    }
  }

  // Text content similarity
  if (oldNode.tag === '#text' && newNode.tag === '#text') {
    const oldText = oldNode.attrs.value || '';
    const newText = newNode.attrs.value || '';
    if (oldText === newText) {
      score += weights.text;
    } else {
      // Partial match based on common prefix
      const commonPrefix = getCommonPrefix(oldText, newText);
      const similarity = commonPrefix.length / Math.max(oldText.length, newText.length);
      score += weights.text * similarity;
    }
  }

  // Attributes overlap
  const oldAttrs = Object.keys(oldNode.attrs).filter(k => k !== 'key');
  const newAttrs = Object.keys(newNode.attrs).filter(k => k !== 'key');
  if (oldAttrs.length > 0 || newAttrs.length > 0) {
    const overlap = calculateSetOverlap(oldAttrs, newAttrs);
    score += weights.attrs * overlap;
  }

  return score;
}

/**
 * Get common prefix of two strings
 */
function getCommonPrefix(a: string, b: string): string {
  const minLen = Math.min(a.length, b.length);
  let i = 0;
  while (i < minLen && a[i] === b[i]) {
    i++;
  }
  return a.slice(0, i);
}

/**
 * Calculate overlap between two sets (Jaccard index)
 */
function calculateSetOverlap(a: string[], b: string[]): number {
  const setA = new Set(a);
  const setB = new Set(b);
  const intersection = [...setA].filter(x => setB.has(x));
  const union = new Set([...setA, ...setB]);
  return intersection.length / union.size;
}

/**
 * Match children of two nodes
 */
export function matchChildren(
  oldChildren: VNode[],
  newChildren: VNode[],
  weights: MatchWeights = DEFAULT_WEIGHTS
): NodeMatch[] {
  const matches: NodeMatch[] = [];
  const oldUsed = new Set<number>();
  const newUsed = new Set<number>();

  // Build similarity matrix
  const matrix: { oldIndex: number; newIndex: number; score: number }[] = [];

  for (let i = 0; i < oldChildren.length; i++) {
    for (let j = 0; j < newChildren.length; j++) {
      const score = calculateSimilarity(oldChildren[i], newChildren[j], weights);
      if (score > 0) {
        matrix.push({ oldIndex: i, newIndex: j, score });
      }
    }
  }

  // Sort by score descending
  matrix.sort((a, b) => b.score - a.score);

  // Greedy matching
  for (const { oldIndex, newIndex } of matrix) {
    if (!oldUsed.has(oldIndex) && !newUsed.has(newIndex)) {
      matches.push({
        oldNode: oldChildren[oldIndex],
        newNode: newChildren[newIndex],
        type: 'match',
      });
      oldUsed.add(oldIndex);
      newUsed.add(newIndex);
    }
  }

  // Add unmatched old nodes as deletions
  for (let i = 0; i < oldChildren.length; i++) {
    if (!oldUsed.has(i)) {
      matches.push({
        oldNode: oldChildren[i],
        newNode: null,
        type: 'del',
      });
    }
  }

  // Add unmatched new nodes as additions
  for (let j = 0; j < newChildren.length; j++) {
    if (!newUsed.has(j)) {
      matches.push({
        oldNode: null,
        newNode: newChildren[j],
        type: 'add',
      });
    }
  }

  // Sort by document order
  matches.sort((a, b) => {
    const aIndex = a.newNode ? parseInt(a.newNode.path.split('/').pop() || '0') :
                   a.oldNode ? parseInt(a.oldNode.path.split('/').pop() || '0') : 0;
    const bIndex = b.newNode ? parseInt(b.newNode.path.split('/').pop() || '0') :
                   b.oldNode ? parseInt(b.oldNode.path.split('/').pop() || '0') : 0;
    return aIndex - bIndex;
  });

  return matches;
}