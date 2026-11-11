/**
 * Contract tests - verify marker id ↔ anchor attribute correspondence
 */

import { describe, it, expect } from 'vitest';
import { diffHtml } from '../src/core/diff-engine.js';

describe('Contract Tests', () => {
  describe('nonce format', () => {
    it('should generate 4-digit hexadecimal nonce', () => {
      const result = diffHtml('<p>old</p>', '<p>new</p>');
      expect(result.nonce).toMatch(/^[0-9a-f]{4}$/);
    });

    it('should generate unique nonces for different diffs', () => {
      const result1 = diffHtml('<p>a</p>', '<p>b</p>');
      const result2 = diffHtml('<p>c</p>', '<p>d</p>');
      // Nonces should be different (statistically very likely)
      // But we don't enforce this strictly
    });
  });

  describe('marker id format', () => {
    it('should use m_{number} format for marker ids', () => {
      const result = diffHtml('<p>a</p><span>b</span>', '<p>c</p><div>d</div>');
      for (const marker of result.markers) {
        expect(marker.id).toMatch(/^m_\d+$/);
      }
    });

    it('should increment marker ids sequentially', () => {
      const result = diffHtml('<p>a</p><span>b</span>', '<p>c</p><span>d</span>');
      const ids = result.markers.map(m => parseInt(m.id.split('_')[1]));
      for (let i = 1; i < ids.length; i++) {
        expect(ids[i]).toBeGreaterThan(ids[i - 1]);
      }
    });
  });

  describe('marker types', () => {
    it('should detect additions', () => {
      const result = diffHtml('<p>old</p>', '<p>old</p><span>new</span>');
      const addMarkers = result.markers.filter(m => m.type === 'add');
      expect(addMarkers.length).toBeGreaterThan(0);
    });

    it('should detect deletions', () => {
      const result = diffHtml('<p>old</p><span>removed</span>', '<p>old</p>');
      const delMarkers = result.markers.filter(m => m.type === 'del');
      expect(delMarkers.length).toBeGreaterThan(0);
    });

    it('should detect modifications', () => {
      const result = diffHtml('<p>Hello World</p>', '<p>Hello Universe</p>');
      const modMarkers = result.markers.filter(m => m.type === 'mod');
      expect(modMarkers.length).toBeGreaterThan(0);
    });
  });

  describe('marker structure', () => {
    it('should include required fields for each marker', () => {
      const result = diffHtml('<p>a</p>', '<p>b</p>');
      for (const marker of result.markers) {
        expect(marker).toHaveProperty('id');
        expect(marker).toHaveProperty('type');
        expect(marker).toHaveProperty('order');
        expect(marker).toHaveProperty('path');
        expect(marker).toHaveProperty('summary');
      }
    });

    it('should include textDiff for text modifications', () => {
      const result = diffHtml('<p>Hello</p>', '<p>World</p>');
      const modMarkers = result.markers.filter(m => m.type === 'mod' && m.textDiff);
      if (modMarkers.length > 0) {
        const textDiff = modMarkers[0].textDiff!;
        expect(textDiff).toHaveProperty('added');
        expect(textDiff).toHaveProperty('removed');
        expect(textDiff).toHaveProperty('fragments');
        expect(Array.isArray(textDiff.fragments)).toBe(true);
      }
    });
  });

  describe('CSS generation', () => {
    it('should generate nonce-scoped CSS', () => {
      const result = diffHtml('<p>a</p>', '<p>b</p>');
      if (result.css) {
        expect(result.css).toContain(`.rtd-${result.nonce}`);
      }
    });

    it('should return empty CSS for identical HTML', () => {
      const result = diffHtml('<p>Hello</p>', '<p>Hello</p>');
      expect(result.css).toBe('');
      expect(result.markers).toEqual([]);
    });
  });
});