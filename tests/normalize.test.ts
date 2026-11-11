/**
 * Tests for normalizer
 */

import { describe, it, expect } from 'vitest';
import {
  normalizeWhitespace,
  normalizeNbsp,
  sortClasses,
  removeEmptyWrappers,
  semanticNormalizer,
  strictNormalizer,
} from '../src/core/normalize.js';
import type { VNode } from '../src/core/types.js';

describe('normalizers', () => {
  describe('normalizeWhitespace', () => {
    it('should collapse multiple spaces', () => {
      const node: VNode = {
        tag: '#text',
        attrs: { value: 'Hello    World' },
        children: [],
        path: '',
      };
      const result = normalizeWhitespace(node);
      expect(result.attrs.value).toBe('Hello World');
    });

    it('should normalize whitespace in nested elements', () => {
      const node: VNode = {
        tag: 'p',
        attrs: {},
        children: [
          {
            tag: '#text',
            attrs: { value: 'Hello    World' },
            children: [],
            path: '/0',
          },
        ],
        path: '',
      };
      const result = normalizeWhitespace(node);
      expect(result.children[0].attrs.value).toBe('Hello World');
    });
  });

  describe('normalizeNbsp', () => {
    it('should replace &nbsp; with space', () => {
      const node: VNode = {
        tag: '#text',
        attrs: { value: 'Hello World' },
        children: [],
        path: '',
      };
      const result = normalizeNbsp(node);
      expect(result.attrs.value).toBe('Hello World');
    });
  });

  describe('sortClasses', () => {
    it('should sort class names alphabetically', () => {
      const node: VNode = {
        tag: 'div',
        attrs: { class: 'z-class a-class m-class' },
        children: [],
        path: '',
      };
      const result = sortClasses(node);
      expect(result.attrs.class).toBe('a-class m-class z-class');
    });

    it('should handle empty class', () => {
      const node: VNode = {
        tag: 'div',
        attrs: {},
        children: [],
        path: '',
      };
      const result = sortClasses(node);
      expect(result.attrs).toEqual({});
    });
  });

  describe('semanticNormalizer', () => {
    it('should apply all transforms', () => {
      const node: VNode = {
        tag: 'div',
        attrs: { class: 'c b a' },
        children: [
          {
            tag: '#text',
            attrs: { value: 'Hello    World' },
            children: [],
            path: '/0',
          },
        ],
        path: '',
      };
      const result = semanticNormalizer(node);
      expect(result.attrs.class).toBe('a b c');
      expect(result.children[0].attrs.value).toBe('Hello World');
    });
  });

  describe('strictNormalizer', () => {
    it('should only normalize whitespace', () => {
      const node: VNode = {
        tag: 'div',
        attrs: { class: 'c b a' },
        children: [
          {
            tag: '#text',
            attrs: { value: 'Hello    World' },
            children: [],
            path: '/0',
          },
        ],
        path: '',
      };
      const result = strictNormalizer(node);
      expect(result.attrs.class).toBe('c b a');
      expect(result.children[0].attrs.value).toBe('Hello World');
    });
  });
});