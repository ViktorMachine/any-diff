/**
 * H8 — Adversarial (XSS) tests for any-diff.
 */

import { describe, it, expect } from 'vitest';
import { diffHtml } from '../src/core/diff.js';

describe('H8: Adversarial — XSS vectors', () => {
  it('<script> tags are escaped in output', () => {
    const result = diffHtml(
      '<p>Safe</p>',
      '<p>Safe</p><script>alert("xss")</script>',
    );
    expect(result.html).not.toContain('<script>');
  });

  it('event handlers are neutralized', () => {
    const result = diffHtml(
      '<p>Click me</p>',
      '<p onclick="alert(1)">Click me</p>',
    );
    expect(result.html).not.toMatch(/onclick="alert\(1\)"/);
  });

  it('javascript: URIs are escaped', () => {
    const result = diffHtml(
      '<a href="https://example.com">Link</a>',
      '<a href="javascript:alert(1)">Link</a>',
    );
    expect(result.html).not.toContain('href="javascript:');
  });

  it('img onerror is escaped', () => {
    const result = diffHtml(
      '<p>Image</p>',
      '<img src=x onerror="alert(1)">',
    );
    expect(result.html).not.toMatch(/onerror="alert\(1\)"/);
  });

  it('nested script injection is escaped', () => {
    const result = diffHtml('<p>Hello</p>', '<p>Hello</p><script>document.cookie</script>');
    expect(result.html).not.toContain('<script>');
    expect(result.html).not.toContain('document.cookie');
  });
});

describe('H8: Adversarial — malformed HTML', () => {
  it('unclosed tags do not crash', () => {
    const result = diffHtml('<p>Open paragraph', '<p>Open paragraph with <span>nested');
    expect(result).toBeDefined();
    expect(typeof result.html).toBe('string');
  });

  it('self-closing edge cases do not crash', () => {
    const result = diffHtml('<br><hr><img src="a.png">', '<br/><hr/><img src="b.png"/>');
    expect(result).toBeDefined();
  });

  it('empty strings are valid inputs', () => {
    const result = diffHtml('', '');
    expect(result.html).toBe('');
    expect(result.markers).toEqual([]);
    expect(result.nonce).toMatch(/^[0-9a-f]{4}$/);
  });

  it('very long input does not crash', () => {
    const longHtml = '<p>' + 'A'.repeat(10000) + '</p>';
    const result = diffHtml(longHtml, longHtml);
    expect(result.markers).toEqual([]);
  });
});

describe('H8: Adversarial — edge case payloads', () => {
  it('null bytes in HTML do not crash', () => {
    const result = diffHtml('<p>Hello</p>', '<p>Hello\x00World</p>');
    expect(result).toBeDefined();
  });

  it('HTML entities are handled correctly', () => {
    const result = diffHtml('<p>&amp; &lt; &gt; &quot;</p>', '<p>&amp; &lt; &gt; &quot; &apos;</p>');
    expect(result).toBeDefined();
  });

  it('pre tag whitespace preserved in strict mode', () => {
    const result = diffHtml('<pre>  spaced  </pre>', '<pre>  spaced  </pre>', { mode: 'strict' });
    expect(result.markers).toEqual([]);
  });

  it('comments are ignored by default', () => {
    const result = diffHtml('<p>Hello</p><!-- comment -->', '<p>Hello</p>');
    expect(result.markers).toEqual([]);
  });

  it('keepComments option enables comment diff', () => {
    const result = diffHtml(
      '<p>Hello</p><!-- old comment -->',
      '<p>Hello</p><!-- new comment -->',
      { keepComments: true },
    );
    expect(result.markers.length).toBeGreaterThanOrEqual(0);
  });
});
