/**
 * Tests for text diff
 */

import { describe, it, expect } from 'vitest';
import { diffText, calculateDiffStats } from '../src/core/text-diff.js';

describe('textDiff', () => {
  describe('diffText', () => {
    it('should return equal for identical text', () => {
      const result = diffText('Hello', 'Hello');
      expect(result).toEqual([{ type: 'equal', text: 'Hello' }]);
    });

    it('should detect additions', () => {
      const result = diffText('', 'Hello');
      expect(result).toEqual([{ type: 'add', text: 'Hello' }]);
    });

    it('should detect deletions', () => {
      const result = diffText('Hello', '');
      expect(result).toEqual([{ type: 'del', text: 'Hello' }]);
    });

    it('should detect modifications', () => {
      const result = diffText('Hello World', 'Hello Universe');
      // Myers diff operates character-by-character
      expect(result[0]).toEqual({ type: 'equal', text: 'Hello ' });
      // The algorithm will find optimal character-level diff
      expect(result.some(f => f.type === 'del')).toBe(true);
      expect(result.some(f => f.type === 'add')).toBe(true);
    });

    it('should handle partial match', () => {
      const result = diffText('abc', 'adc');
      expect(result).toEqual([
        { type: 'equal', text: 'a' },
        { type: 'del', text: 'b' },
        { type: 'add', text: 'd' },
        { type: 'equal', text: 'c' },
      ]);
    });

    it('should handle multiple changes', () => {
      const result = diffText('The cat sat', 'The dog ran');
      expect(result.some(f => f.type === 'equal' && f.text === 'The ')).toBe(true);
    });

    it('should consolidate consecutive edits', () => {
      const result = diffText('abc', 'xyz');
      expect(result).toEqual([
        { type: 'del', text: 'abc' },
        { type: 'add', text: 'xyz' },
      ]);
    });
  });

  describe('calculateDiffStats', () => {
    it('should calculate added and removed counts', () => {
      const fragments = [
        { type: 'equal' as const, text: 'Hello ' },
        { type: 'del' as const, text: 'World' },
        { type: 'add' as const, text: 'Universe' },
      ];
      const stats = calculateDiffStats(fragments);
      expect(stats.added).toBe(8);
      expect(stats.removed).toBe(5);
    });

    it('should return zero for no changes', () => {
      const fragments = [{ type: 'equal' as const, text: 'Hello' }];
      const stats = calculateDiffStats(fragments);
      expect(stats.added).toBe(0);
      expect(stats.removed).toBe(0);
    });
  });
});