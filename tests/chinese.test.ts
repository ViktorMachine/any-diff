/**
 * Test for P1 Chinese normalization issue
 */

import { describe, it, expect } from 'vitest';
import { diffHtml } from '../src/core/diff-engine.js';

describe('Chinese text diff', () => {
  it('should detect changes in Chinese text (semantic mode)', () => {
    const result = diffHtml(
      '<p>这是一个测试段落。</p>',
      '<p>这是另一个测试段落。</p>',
      { mode: 'semantic' }
    );
    expect(result.markers.length).toBeGreaterThan(0);
    expect(result.markers.some(m => m.type === 'mod')).toBe(true);
  });

  it('should detect changes in Chinese text (strict mode)', () => {
    const result = diffHtml(
      '<p>这是一个测试段落。</p>',
      '<p>这是另一个测试段落。</p>',
      { mode: 'strict' }
    );
    expect(result.markers.length).toBeGreaterThan(0);
    expect(result.markers.some(m => m.type === 'mod')).toBe(true);
  });

  it('should handle Tiptap sample (semantic mode)', () => {
    const oldHtml = `
<p>这是一个<strong>简单</strong>的测试段落。</p>
<h2>标题测试</h2>
<p>包含一些 <code>代码片段</code> 和 <em>斜体文本</em>。</p>
`;

    const newHtml = `
<p>这是一个<strong>更新后</strong>的测试段落。</p>
<h2>标题测试</h2>
<p>包含一些 <code>代码片段</code> 和 <em>新的斜体文本</em>，以及额外内容。</p>
<blockquote>新增引用块</blockquote>
`;

    const result = diffHtml(oldHtml, newHtml, { mode: 'semantic' });
    console.log('Semantic markers:', result.markers.length, result.markers.map(m => m.type));
    expect(result.markers.length).toBeGreaterThan(0);
  });

  it('should handle Tiptap sample (strict mode)', () => {
    const oldHtml = `
<p>这是一个<strong>简单</strong>的测试段落。</p>
<h2>标题测试</h2>
<p>包含一些 <code>代码片段</code> 和 <em>斜体文本</em>。</p>
`;

    const newHtml = `
<p>这是一个<strong>更新后</strong>的测试段落。</p>
<h2>标题测试</h2>
<p>包含一些 <code>代码片段</code> 和 <em>新的斜体文本</em>，以及额外内容。</p>
<blockquote>新增引用块</blockquote>
`;

    const result = diffHtml(oldHtml, newHtml, { mode: 'strict' });
    console.log('Strict markers:', result.markers.length, result.markers.map(m => m.type));
    expect(result.markers.length).toBeGreaterThan(0);
  });
});