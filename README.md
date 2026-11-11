# @mortar_zh/any-diff

Framework-agnostic HTML diff library with structured markers.

## Installation

```bash
npm install @mortar_zh/any-diff
```

## Usage

```typescript
import { diffHtml } from '@mortar_zh/any-diff';

const oldHtml = '<p>Hello World</p>';
const newHtml = '<p>Hello Universe</p>';

const result = diffHtml(oldHtml, newHtml);

console.log(result.markers); // Array of diff markers
console.log(result.html);    // Rendered HTML with anchors
console.log(result.css);     // Nonce-scoped CSS
```

## API

### `diffHtml(oldHtml, newHtml, options?)`

- `oldHtml`: Old HTML string
- `newHtml`: New HTML string
- `options`: Diff options

Returns `DiffResult`:
- `html`: Rendered HTML with anchor attributes
- `css`: Nonce-scoped CSS styles
- `markers`: List of diff markers
- `nonce`: Random nonce for this diff

## License

MIT