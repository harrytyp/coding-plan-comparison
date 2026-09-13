# Theme tokens

Source: `public/index.html` (inline <style>). Vanilla CSS, no framework, no Tailwind.

## Part 1 — Token summary

### Light (`:root`)
- `--bg: #f8fafc`
- `--bg-elev: #ffffff`
- `--bg-muted: #f1f5f9`
- `--text: #0f172a`
- `--text-muted: #64748b`
- `--text-faint: #94a3b8`
- `--border: #e2e8f0`
- `--border-strong: #cbd5e1`
- `--primary: #0b57d0`
- `--primary-strong: #0842a0`
- `--primary-soft: #e8f0fe`
- `--success: #0d9488`
- `--success-soft: #ccfbf1`
- `--info: #2563eb`
- `--info-soft: #dbeafe`
- `--warn: #d97706`
- `--warn-soft: #fef3c7`
- `--danger: #dc2626`
- `--danger-soft: #fee2e2`
- `--radius: 10px`
- `--radius-sm: 6px`
- `--shadow-sm: 0 1px 2px rgba(15,23,42,.05)`
- `--shadow-md: 0 3px 10px rgba(15,23,42,.07), 0 1px 3px rgba(15,23,42,.05)`
- `--shadow-lg: 0 12px 32px rgba(15,23,42,.10)`
- `--font: "Inter", "SF Pro Text", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`
- `--font-display: Georgia, "Times New Roman", "Nimbus Roman", serif`
- `--mono: "JetBrains Mono", "SF Mono", ui-monospace, "Cascadia Code", Menlo, monospace`
- `--maxw: 1180px`

### Dark (`[data-theme="dark"]`)
- `--bg: #0b1220`
- `--bg-elev: #111a2e`
- `--bg-muted: #16223a`
- `--text: #e2e8f0`
- `--text-muted: #94a3b8`
- `--text-faint: #64748b`
- `--border: #1e293b`
- `--border-strong: #334155`
- `--primary: #6ea8fe`
- `--primary-strong: #93c5fd`
- `--primary-soft: #172a45`
- `--success: #2dd4bf`
- `--success-soft: #0f2e2a`
- `--info: #60a5fa`
- `--info-soft: #172a45`
- `--warn: #fbbf24`
- `--warn-soft: #2e2410`
- `--danger: #f87171`
- `--danger-soft: #3a1717`
- `--shadow-sm: 0 1px 2px rgba(0,0,0,.4), 0 1px 3px rgba(0,0,0,.3)`
- `--shadow-md: 0 4px 12px rgba(0,0,0,.45)`
- `--shadow-lg: 0 16px 40px rgba(0,0,0,.5)`

- Type: system stack for UI, one display font for headings (see `--font-display` above), monospace numerals via `.num` (`font-variant-numeric: tabular-nums`).
- Breakpoint in use: `@media (max-width: 760px)` (mobile shell), plus a wider table breakpoint.
- Radius/shadows come from the tokens above; there is no spacing scale variable, paddings are literal.

## Part 2 — Raw source

```css
:root {
  --bg: #f8fafc;
  --bg-elev: #ffffff;
  --bg-muted: #f1f5f9;
  --text: #0f172a;
  --text-muted: #64748b;
  --text-faint: #94a3b8;
  --border: #e2e8f0;
  --border-strong: #cbd5e1;
  --primary: #0b57d0;
  --primary-strong: #0842a0;
  --primary-soft: #e8f0fe;
  --success: #0d9488;
  --success-soft: #ccfbf1;
  --info: #2563eb;
  --info-soft: #dbeafe;
  --warn: #d97706;
  --warn-soft: #fef3c7;
  --danger: #dc2626;
  --danger-soft: #fee2e2;
  --radius: 10px;
  --radius-sm: 6px;
  --shadow-sm: 0 1px 2px rgba(15,23,42,.05);
  --shadow-md: 0 3px 10px rgba(15,23,42,.07), 0 1px 3px rgba(15,23,42,.05);
  --shadow-lg: 0 12px 32px rgba(15,23,42,.10);
  --font: "Inter", "SF Pro Text", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  --font-display: Georgia, "Times New Roman", "Nimbus Roman", serif;
  --mono: "JetBrains Mono", "SF Mono", ui-monospace, "Cascadia Code", Menlo, monospace;
  --maxw: 1180px;
}
```

```css
[data-theme="dark"] {
  --bg: #0b1220;
  --bg-elev: #111a2e;
  --bg-muted: #16223a;
  --text: #e2e8f0;
  --text-muted: #94a3b8;
  --text-faint: #64748b;
  --border: #1e293b;
  --border-strong: #334155;
  --primary: #6ea8fe;
  --primary-strong: #93c5fd;
  --primary-soft: #172a45;
  --success: #2dd4bf;
  --success-soft: #0f2e2a;
  --info: #60a5fa;
  --info-soft: #172a45;
  --warn: #fbbf24;
  --warn-soft: #2e2410;
  --danger: #f87171;
  --danger-soft: #3a1717;
  --shadow-sm: 0 1px 2px rgba(0,0,0,.4), 0 1px 3px rgba(0,0,0,.3);
  --shadow-md: 0 4px 12px rgba(0,0,0,.45);
  --shadow-lg: 0 16px 40px rgba(0,0,0,.5);
}
```
