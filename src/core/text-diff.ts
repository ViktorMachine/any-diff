/**
 * Text diff using Myers algorithm
 */

import type { TextFragment } from './types.js';

/**
 * Myers diff implementation
 * Based on the paper: "An O(ND) Difference Algorithm and Its Variations" by Eugene W. Myers
 */

/**
 * Edit operation type
 */
type EditType = 'equal' | 'add' | 'del';

/**
 * Edit operation
 */
interface Edit {
  type: EditType;
  text: string;
}

/**
 * Compute diff between two strings using Myers algorithm
 * @param oldText - Old text
 * @param newText - New text
 * @returns Array of text fragments
 */
export function diffText(oldText: string, newText: string): TextFragment[] {
  if (oldText === newText) {
    return [{ type: 'equal', text: oldText }];
  }

  if (!oldText) {
    return [{ type: 'add', text: newText }];
  }

  if (!newText) {
    return [{ type: 'del', text: oldText }];
  }

  const edits = myersDiff(oldText, newText);
  return consolidateEdits(edits);
}

/**
 * Myers diff algorithm implementation
 */
function myersDiff(oldText: string, newText: string): Edit[] {
  const oldLines = oldText.split('');
  const newLines = newText.split('');

  const N = oldLines.length;
  const M = newLines.length;

  // Maximum possible edit distance
  const MAX = N + M;

  // Array to store furthest reaching D-paths
  const V: number[] = new Array(2 * MAX + 1);
  V[MAX + 1] = 0;

  // Store the path
  const trace: number[][] = [];

  for (let D = 0; D <= MAX; D++) {
    trace.push([...V]);

    for (let k = -D; k <= D; k += 2) {
      const kIndex = MAX + k;

      let x: number;
      if (k === -D || (k !== D && V[kIndex - 1] < V[kIndex + 1])) {
        x = V[kIndex + 1];
      } else {
        x = V[kIndex - 1] + 1;
      }

      let y = x - k;

      // Extend diagonal
      while (x < N && y < M && oldLines[x] === newLines[y]) {
        x++;
        y++;
      }

      V[kIndex] = x;

      if (x >= N && y >= M) {
        return backtrack(trace, oldLines, newLines, MAX, D);
      }
    }
  }

  return [];
}

/**
 * Backtrack through the trace to get the edit script
 */
function backtrack(
  trace: number[][],
  oldLines: string[],
  newLines: string[],
  MAX: number,
  D: number
): Edit[] {
  const edits: Edit[] = [];
  let x = oldLines.length;
  let y = newLines.length;

  for (let d = D; d >= 0; d--) {
    const V = trace[d];
    const k = x - y;
    const kIndex = MAX + k;

    const prevK = k === -d || (k !== d && V[kIndex - 1] < V[kIndex + 1])
      ? k + 1
      : k - 1;

    const prevKIndex = MAX + prevK;
    const prevX = V[prevKIndex];
    const prevY = prevX - prevK;

    // Follow diagonal
    while (x > prevX && y > prevY) {
      x--;
      y--;
      edits.unshift({ type: 'equal', text: oldLines[x] });
    }

    if (d > 0) {
      if (x === prevX) {
        y--;
        edits.unshift({ type: 'add', text: newLines[y] });
      } else {
        x--;
        edits.unshift({ type: 'del', text: oldLines[x] });
      }
    }
  }

  return edits;
}

/**
 * Consolidate consecutive edits of the same type
 */
function consolidateEdits(edits: Edit[]): TextFragment[] {
  if (edits.length === 0) {
    return [];
  }

  const fragments: TextFragment[] = [];
  let current: TextFragment = { type: edits[0].type, text: '' };

  for (const edit of edits) {
    if (edit.type === current.type) {
      current.text += edit.text;
    } else {
      fragments.push(current);
      current = { type: edit.type, text: edit.text };
    }
  }

  fragments.push(current);
  return fragments;
}

/**
 * Calculate diff statistics
 */
export function calculateDiffStats(fragments: TextFragment[]): { added: number; removed: number } {
  let added = 0;
  let removed = 0;

  for (const fragment of fragments) {
    if (fragment.type === 'add') {
      added += fragment.text.length;
    } else if (fragment.type === 'del') {
      removed += fragment.text.length;
    }
  }

  return { added, removed };
}