/**
 * Diff engine - combines all modules
 */

import type { DiffResult, DiffMarker, DiffOptions, VNode, MarkerType } from './types.js';
import { parseHtml } from './parser.js';
import { semanticNormalizer, strictNormalizer } from './normalize.js';
import { matchChildren } from './matcher.js';
import { diffText, calculateDiffStats } from './text-diff.js';

/**
 * Generate nonce (4-digit hexadecimal)
 */
function generateNonce(): string {
  return Math.random().toString(16).slice(2, 6).padStart(4, '0');
}

/**
 * Recursively diff two VNode trees
 */
function diffTrees(
  oldNode: VNode,
  newNode: VNode,
  options: DiffOptions,
  markerCounter: { count: number },
  parentPath: string
): DiffMarker[] {
  const markers: DiffMarker[] = [];

  // Match children
  const matches = matchChildren(oldNode.children, newNode.children);

  for (const match of matches) {
    if (match.type === 'add' && match.newNode) {
      // Addition
      markers.push({
        id: `m_${markerCounter.count++}`,
        type: 'add',
        order: markers.length,
        path: match.newNode.path,
        summary: generateSummary('add', match.newNode, options.locale),
      });
    } else if (match.type === 'del' && match.oldNode) {
      // Deletion
      markers.push({
        id: `m_${markerCounter.count++}`,
        type: 'del',
        order: markers.length,
        path: match.oldNode.path,
        summary: generateSummary('del', match.oldNode, options.locale),
      });
    } else if (match.oldNode && match.newNode) {
      // Match - recurse or diff text
      if (match.oldNode.tag === '#text' && match.newNode.tag === '#text') {
        const oldText = match.oldNode.attrs.value || '';
        const newText = match.newNode.attrs.value || '';

        if (oldText !== newText) {
          const fragments = diffText(oldText, newText);
          const stats = calculateDiffStats(fragments);

          markers.push({
            id: `m_${markerCounter.count++}`,
            type: 'mod',
            order: markers.length,
            path: match.newNode.path,
            summary: generateSummary('mod', match.newNode, options.locale, stats),
            textDiff: {
              added: stats.added,
              removed: stats.removed,
              fragments,
            },
          });
        }
      } else {
        // Recurse into children
        const childMarkers = diffTrees(
          match.oldNode,
          match.newNode,
          options,
          markerCounter,
          match.newNode.path
        );
        markers.push(...childMarkers);
      }
    }
  }

  return markers;
}

/**
 * Generate human-readable summary
 */
function generateSummary(
  type: MarkerType,
  node: VNode,
  locale?: string,
  stats?: { added: number; removed: number }
): string {
  const isZhCN = locale === 'zh-CN' || !locale;

  if (type === 'add') {
    return isZhCN ? `新增: ${node.tag}` : `Added: ${node.tag}`;
  }

  if (type === 'del') {
    return isZhCN ? `删除: ${node.tag}` : `Removed: ${node.tag}`;
  }

  if (type === 'mod' && stats) {
    return isZhCN
      ? `修改: +${stats.added}/-${stats.removed} 字符`
      : `Modified: +${stats.added}/-${stats.removed} chars`;
  }

  return '';
}

/**
 * Main diff function
 * @param oldHtml - Old HTML string
 * @param newHtml - New HTML string
 * @param options - Diff options
 * @returns Diff result with markers, HTML, and CSS
 */
export function diffHtml(
  oldHtml: string,
  newHtml: string,
  options: DiffOptions = {}
): DiffResult {
  // Input validation
  if (typeof oldHtml !== 'string') {
    throw new TypeError('oldHtml must be a string');
  }
  if (typeof newHtml !== 'string') {
    throw new TypeError('newHtml must be a string');
  }

  const nonce = generateNonce();
  const mode = options.mode || 'semantic';
  const locale = options.locale || 'zh-CN';

  // Parse HTML to VNode trees
  let oldTree = parseHtml(oldHtml);
  let newTree = parseHtml(newHtml);

  // Normalize based on mode
  const normalizer = mode === 'semantic' ? semanticNormalizer : strictNormalizer;
  oldTree = normalizer(oldTree);
  newTree = normalizer(newTree);

  // Diff trees
  const markerCounter = { count: 0 };
  const markers = diffTrees(oldTree, newTree, { ...options, locale }, markerCounter, '');

  // Generate CSS for markers
  const css = generateCss(nonce, markers);

  // For now, return newHtml as-is (serialization with anchors to be implemented)
  const html = newHtml;

  return {
    html,
    css,
    markers,
    nonce,
  };
}

/**
 * Generate CSS for markers
 */
function generateCss(nonce: string, markers: DiffMarker[]): string {
  if (markers.length === 0) {
    return '';
  }

  const lines: string[] = [];

  // Add styles
  lines.push(`.rtd-${nonce}-add { background-color: #d4edda; }`);
  lines.push(`.rtd-${nonce}-del { background-color: #f8d7da; text-decoration: line-through; }`);
  lines.push(`.rtd-${nonce}-mod { background-color: #fff3cd; }`);

  return lines.join('\n');
}