/**
 * Core type definitions for any-diff
 */

/**
 * Marker types for diff results
 */
export type MarkerType = 'add' | 'del' | 'mod';

/**
 * Text diff fragment
 */
export interface TextFragment {
  type: 'equal' | 'add' | 'del';
  text: string;
}

/**
 * Text diff details
 */
export interface TextDiff {
  added: number;
  removed: number;
  fragments: TextFragment[];
}

/**
 * Style change details
 */
export interface StyleChange {
  property: string;
  from: string;
  to: string;
}

/**
 * Style diff details
 */
export interface StyleDiff {
  changed: StyleChange[];
  added: string[];
  removed: string[];
}

/**
 * Diff marker - represents a single difference
 */
export interface DiffMarker {
  /** Marker ID (e.g., 'm_0', 'm_1') */
  id: string;
  /** Marker type */
  type: MarkerType;
  /** Document order */
  order: number;
  /** Node path in AST */
  path: string;
  /** Human-readable summary */
  summary: string;
  /** Parent marker ID for grouping */
  parentId?: string;
  /** Text diff details */
  textDiff?: TextDiff;
  /** Style diff details */
  styleDiff?: StyleDiff;
}

/**
 * Diff result - main output structure
 */
export interface DiffResult {
  /** Rendered HTML with anchor attributes */
  html: string;
  /** Nonce-scoped CSS styles */
  css: string;
  /** List of markers in document order */
  markers: DiffMarker[];
  /** Random nonce for this diff (e.g., '7f3a') */
  nonce: string;
}

/**
 * Diff mode
 */
export type DiffMode = 'strict' | 'semantic';

/**
 * Diff granularity
 */
export type DiffGranularity = 'block' | 'text';

/**
 * Locale for summary generation
 */
export type Locale = 'zh-CN' | 'en';

/**
 * Diff options
 */
export interface DiffOptions {
  /** Normalization mode */
  mode?: DiffMode;
  /** Diff granularity */
  granularity?: DiffGranularity;
  /** Summary language */
  locale?: Locale;
  /** Show removed content in place */
  showRemovedInPlace?: boolean;
  /** Style properties to ignore */
  ignoreStyles?: string[];
  /** Class to style mapping */
  classStyleMap?: Record<string, Record<string, string>>;
  /** Keep comment nodes */
  keepComments?: boolean;
}

/**
 * Internal VNode representation
 */
export interface VNode {
  /** Tag name (e.g., 'p', 'span', '#text') */
  tag: string;
  /** Attributes */
  attrs: Record<string, string>;
  /** Child nodes */
  children: VNode[];
  /** Node path in tree (e.g., '/0/2/1') */
  path: string;
}