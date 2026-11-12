/**
 * H9 — Fuzz tests for any-diff using fast-check.
 */

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { diffHtml } from '../src/core/diff.js';

describe('H9: Fuzz — random HTML inputs', () => {
  it('diffHtml never crashes on arbitrary HTML strings', () => {
    fc.assert(
      fc.property(fc.string(), (input) => {
        const result = diffHtml('', input);
        expect(result).toHaveProperty('html');
        expect(result).toHaveProperty('css');
        expect(result).toHaveProperty('markers');
        expect(result).toHaveProperty('nonce');
        expect(result.nonce).toMatch(/^[0-9a-f]{4}$/);
      }),
      { numRuns: 100 },
    );
  });

  it('diffHtml with two arbitrary strings produces valid structure', () => {
    fc.assert(
      fc.property(fc.string(), fc.string(), (oldHtml, newHtml) => {
        const result = diffHtml(oldHtml, newHtml);
        expect(typeof result.html).toBe('string');
        expect(typeof result.css).toBe('string');
        expect(Array.isArray(result.markers)).toBe(true);
        expect(typeof result.nonce).toBe('string');
        expect(result.nonce.length).toBe(4);
      }),
      { numRuns: 50 },
    );
  });

  it('diffHtml with options never crashes', () => {
    fc.assert(
      fc.property(
        fc.string(),
        fc.string(),
        fc.constantFrom('strict' as const, 'semantic' as const),
        (oldHtml, newHtml, mode) => {
          const result = diffHtml(oldHtml, newHtml, { mode });
          expect(result).toBeDefined();
        },
      ),
      { numRuns: 50 },
    );
  });
});
