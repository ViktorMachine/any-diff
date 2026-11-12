/**
 * Fixture: Quill editor sample HTML.
 * Simulates a rich text editor output with spans, classes, and inline styles.
 */

export const quillOld = `
<p><span class="ql-size-large">Hello <strong>world</strong></span></p>
<p>This is a <span style="color: red;">test paragraph</span> with some text.</p>
<ul>
  <li>Item one</li>
  <li>Item two</li>
</ul>
`;

export const quillNew = `
<p><span class="ql-size-large">Hello <strong>everyone</strong></span></p>
<p>This is a <span style="color: blue;">test paragraph</span> with some text and more content.</p>
<ul>
  <li>Item one</li>
  <li>Item two updated</li>
  <li>Item three added</li>
</ul>
`;
