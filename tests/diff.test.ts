/**
 * Tests for core diff function
 */

import { describe, it, expect } from 'vitest';
import { diffHtml } from '../src/core/diff.js';

describe('diffHtml', () => {
  it('should throw TypeError for non-string input', () => {
    // @ts-expect-error Testing invalid input
    expect(() => diffHtml(null, '')).toThrow(TypeError);
    // @ts-expect-error Testing invalid input
    expect(() => diffHtml('', undefined)).toThrow(TypeError);
  });

  it('should return valid structure for empty inputs', () => {
    const result = diffHtml('', '');

    expect(result).toHaveProperty('html');
    expect(result).toHaveProperty('css');
    expect(result).toHaveProperty('markers');
    expect(result).toHaveProperty('nonce');
    expect(result.markers).toEqual([]);
  });

  it('should generate 4-digit hex nonce', () => {
    const result = diffHtml('<p>old</p>', '<p>new</p>');

    expect(result.nonce).toMatch(/^[0-9a-f]{4}$/);
  });

  it('should handle identical HTML', () => {
    const html = '<p>Hello <strong>World</strong></p>';
    const result = diffHtml(html, html);

    expect(result.html).toBe(html);
    expect(result.markers).toEqual([]);
  });
});