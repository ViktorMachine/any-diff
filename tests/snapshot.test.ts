/**
 * H7 — Snapshot tests for any-diff.
 *
 * Uses real-editor fixture HTML (Quill, Tiptap, Word paste) to verify
 * the full diffHtml pipeline output via Vitest snapshots.
 */

import { describe, it, expect } from 'vitest';
import { diffHtml } from '../src/core/diff.js';
import { quillOld, quillNew } from './fixtures/quill-sample.js';
import { tiptapOld, tiptapNew } from './fixtures/tiptap-sample.js';
import { wordOld, wordNew } from './fixtures/word-paste-sample.js';

describe('H7: Snapshot tests — Quill editor', () => {
  it('semantic mode produces expected markers and html', () => {
    const result = diffHtml(quillOld, quillNew, {
      mode: 'semantic',
      granularity: 'text',
      locale: 'zh-CN',
    });

    expect(result).toMatchObject({
      html: expect.any(String),
      css: expect.any(String),
      markers: expect.any(Array),
      nonce: expect.stringMatching(/^[0-9a-f]{4}$/),
    });

    for (const marker of result.markers) {
      expect(marker.id).toMatch(/^m_\d+$/);
      expect(['add', 'del', 'mod']).toContain(marker.type);
      expect(typeof marker.order).toBe('number');
      expect(typeof marker.summary).toBe('string');
    }

    expect({
      html: result.html,
      css: result.css,
      markerCount: result.markers.length,
      markerTypes: result.markers.map((m) => m.type),
    }).toMatchSnapshot();
  });
});

describe('H7: Snapshot tests — Tiptap editor', () => {
  it('semantic mode with Chinese text', () => {
    const result = diffHtml(tiptapOld, tiptapNew, {
      mode: 'semantic',
      granularity: 'text',
      locale: 'zh-CN',
    });

    expect(result.markers.length).toBeGreaterThan(0);

    expect({
      html: result.html,
      css: result.css,
      markerCount: result.markers.length,
    }).toMatchSnapshot();
  });
});

describe('H7: Snapshot tests — Word paste', () => {
  it('handles excessive Word styling noise', () => {
    const result = diffHtml(wordOld, wordNew, {
      mode: 'semantic',
      granularity: 'text',
      locale: 'zh-CN',
    });

    expect({
      html: result.html,
      css: result.css,
      markerCount: result.markers.length,
    }).toMatchSnapshot();
  });
});

describe('H7: Snapshot tests — strict vs semantic', () => {
  it('strict mode produces more or equal markers than semantic', () => {
    const strictResult = diffHtml(quillOld, quillNew, { mode: 'strict' });
    const semanticResult = diffHtml(quillOld, quillNew, { mode: 'semantic' });

    expect(strictResult.markers.length).toBeGreaterThanOrEqual(
      semanticResult.markers.length,
    );

    expect({
      strictMarkers: strictResult.markers.length,
      semanticMarkers: semanticResult.markers.length,
    }).toMatchSnapshot();
  });
});
