/**
 * Tests for HTML parser
 */

import { describe, it, expect } from 'vitest';
import { parseHtml } from '../src/core/parser.js';

describe('parseHtml', () => {
  it('should parse simple HTML', () => {
    const html = '<p>Hello</p>';
    const result = parseHtml(html);

    expect(result.tag).toBe('#document-fragment');
    expect(result.children).toHaveLength(1);
    expect(result.children[0].tag).toBe('p');
  });

  it('should parse nested elements', () => {
    const html = '<div><p><strong>Bold</strong></p></div>';
    const result = parseHtml(html);

    expect(result.tag).toBe('#document-fragment');
    expect(result.children[0].tag).toBe('div');
    expect(result.children[0].children[0].tag).toBe('p');
    expect(result.children[0].children[0].children[0].tag).toBe('strong');
  });

  it('should parse attributes', () => {
    const html = '<a href="https://example.com" class="link">Link</a>';
    const result = parseHtml(html);

    const link = result.children[0];
    expect(link.attrs.href).toBe('https://example.com');
    expect(link.attrs.class).toBe('link');
  });

  it('should parse text nodes', () => {
    const html = '<p>Hello World</p>';
    const result = parseHtml(html);

    const text = result.children[0].children[0];
    expect(text.tag).toBe('#text');
    expect(text.attrs.value).toBe('Hello World');
  });

  it('should parse mixed content', () => {
    const html = '<p>Hello <strong>World</strong>!</p>';
    const result = parseHtml(html);

    const p = result.children[0];
    expect(p.children).toHaveLength(3);
    expect(p.children[0].tag).toBe('#text');
    expect(p.children[1].tag).toBe('strong');
    expect(p.children[2].tag).toBe('#text');
  });

  it('should generate correct paths', () => {
    const html = '<div><p>Text</p></div>';
    const result = parseHtml(html);

    expect(result.path).toBe('');
    expect(result.children[0].path).toBe('/0');
    expect(result.children[0].children[0].path).toBe('/0/0');
    expect(result.children[0].children[0].children[0].path).toBe('/0/0/0');
  });

  it('should handle empty HTML', () => {
    const html = '';
    const result = parseHtml(html);

    expect(result.tag).toBe('#document-fragment');
    expect(result.children).toHaveLength(0);
  });

  it('should handle self-closing tags', () => {
    const html = '<br/><img src="test.jpg"/>';
    const result = parseHtml(html);

    expect(result.children).toHaveLength(2);
    expect(result.children[0].tag).toBe('br');
    expect(result.children[1].tag).toBe('img');
  });
});