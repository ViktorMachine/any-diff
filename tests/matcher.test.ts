/**
 * Tests for tree matcher
 */

import { describe, it, expect } from 'vitest';
import { calculateSimilarity, matchChildren } from '../src/core/matcher.js';
import type { VNode } from '../src/core/types.js';

describe('matcher', () => {
  describe('calculateSimilarity', () => {
    it('should return -1 for different tags', () => {
      const oldNode: VNode = {
        tag: 'div',
        attrs: {},
        children: [],
        path: '',
      };
      const newNode: VNode = {
        tag: 'span',
        attrs: {},
        children: [],
        path: '',
      };
      expect(calculateSimilarity(oldNode, newNode)).toBe(-1);
    });

    it('should return high score for identical nodes', () => {
      const oldNode: VNode = {
        tag: 'p',
        attrs: { class: 'text' },
        children: [],
        path: '',
      };
      const newNode: VNode = {
        tag: 'p',
        attrs: { class: 'text' },
        children: [],
        path: '',
      };
      expect(calculateSimilarity(oldNode, newNode)).toBeGreaterThan(100);
    });

    it('should boost score for matching key attribute', () => {
      const oldNode: VNode = {
        tag: 'li',
        attrs: { key: 'item-1' },
        children: [],
        path: '',
      };
      const newNode: VNode = {
        tag: 'li',
        attrs: { key: 'item-1' },
        children: [],
        path: '',
      };
      const noKeyOld: VNode = {
        tag: 'li',
        attrs: {},
        children: [],
        path: '',
      };
      const noKeyNew: VNode = {
        tag: 'li',
        attrs: {},
        children: [],
        path: '',
      };

      const withKeyScore = calculateSimilarity(oldNode, newNode);
      const withoutKeyScore = calculateSimilarity(noKeyOld, noKeyNew);
      expect(withKeyScore).toBeGreaterThan(withoutKeyScore);
    });

    it('should calculate text similarity', () => {
      const oldNode: VNode = {
        tag: '#text',
        attrs: { value: 'Hello World' },
        children: [],
        path: '',
      };
      const newNode: VNode = {
        tag: '#text',
        attrs: { value: 'Hello World' },
        children: [],
        path: '',
      };
      expect(calculateSimilarity(oldNode, newNode)).toBeGreaterThan(100);
    });
  });

  describe('matchChildren', () => {
    it('should match identical children', () => {
      const oldChildren: VNode[] = [
        { tag: 'p', attrs: {}, children: [], path: '/0' },
        { tag: 'span', attrs: {}, children: [], path: '/1' },
      ];
      const newChildren: VNode[] = [
        { tag: 'p', attrs: {}, children: [], path: '/0' },
        { tag: 'span', attrs: {}, children: [], path: '/1' },
      ];

      const matches = matchChildren(oldChildren, newChildren);
      expect(matches).toHaveLength(2);
      expect(matches[0].type).toBe('match');
      expect(matches[1].type).toBe('match');
    });

    it('should detect additions', () => {
      const oldChildren: VNode[] = [
        { tag: 'p', attrs: {}, children: [], path: '/0' },
      ];
      const newChildren: VNode[] = [
        { tag: 'p', attrs: {}, children: [], path: '/0' },
        { tag: 'span', attrs: {}, children: [], path: '/1' },
      ];

      const matches = matchChildren(oldChildren, newChildren);
      const additions = matches.filter(m => m.type === 'add');
      expect(additions).toHaveLength(1);
      expect(additions[0].newNode?.tag).toBe('span');
    });

    it('should detect deletions', () => {
      const oldChildren: VNode[] = [
        { tag: 'p', attrs: {}, children: [], path: '/0' },
        { tag: 'span', attrs: {}, children: [], path: '/1' },
      ];
      const newChildren: VNode[] = [
        { tag: 'p', attrs: {}, children: [], path: '/0' },
      ];

      const matches = matchChildren(oldChildren, newChildren);
      const deletions = matches.filter(m => m.type === 'del');
      expect(deletions).toHaveLength(1);
      expect(deletions[0].oldNode?.tag).toBe('span');
    });

    it('should use key attribute for matching', () => {
      const oldChildren: VNode[] = [
        { tag: 'li', attrs: { key: 'a' }, children: [], path: '/0' },
        { tag: 'li', attrs: { key: 'b' }, children: [], path: '/1' },
      ];
      const newChildren: VNode[] = [
        { tag: 'li', attrs: { key: 'b' }, children: [], path: '/0' },
        { tag: 'li', attrs: { key: 'a' }, children: [], path: '/1' },
      ];

      const matches = matchChildren(oldChildren, newChildren);
      const matchA = matches.find(m => m.oldNode?.attrs.key === 'a');
      const matchB = matches.find(m => m.oldNode?.attrs.key === 'b');

      expect(matchA?.newNode?.attrs.key).toBe('a');
      expect(matchB?.newNode?.attrs.key).toBe('b');
    });
  });
});