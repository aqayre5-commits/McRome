# Design System Spec

## 1. Tokens

| Token | Value | Usage |
|---|---|---|
| Color / Background / App | `slate-50` | Global page background |
| Color / Surface / Default | `white` | Cards and forms |
| Color / Surface / Accent | `brand-50` | Highlight blocks |
| Color / Text / Primary | `slate-950` | Headings |
| Color / Text / Secondary | `slate-700` | Body copy |
| Color / Action / Primary | `brand-600` | Primary buttons and links |
| Color / Action / Hover | `brand-700` | Primary hover |
| Color / Border / Default | `slate-200` | Card borders |
| Radius / Card | `24px` | Primary card shape |
| Radius / Input | `12px` | Fields and buttons |
| Shadow / Default | `soft` | Elevated cards |
| Font / UI | `system sans-serif` | Low-complexity stack |

## 2. Type Scale

| Rank | Token | Size | Weight | Usage |
|---|---|---|---|---|
| 1 | Display | 48px | 700 | Landing hero |
| 2 | H1 | 36px | 700 | Page headers |
| 3 | H2 | 30px | 600 | Section headers |
| 4 | H3 | 20px | 600 | Card titles |
| 5 | Body | 16px | 400 | Paragraphs |
| 6 | Small | 14px | 400 | Helper text |
| 7 | Label | 12px | 600 | Eyebrows and badges |

## 3. Layout Grid

| Breakpoint | Container | Columns | Gap |
|---|---|---|---|
| Mobile | 100% - 16px padding | 1 | 16px |
| Tablet | 100% - 24px padding | 2 | 20px |
| Desktop | 1152px max | 12 | 24px |

## 4. Component Rules

| Component | Rule |
|---|---|
| Buttons | One primary button per section |
| Cards | Use border + soft shadow; avoid nested shadows |
| Forms | Single-column on mobile; inline only from tablet up |
| Images | Decorative only on landing; informative on game pages |
| Navigation | Max 4 primary items in header |
| Copy density | 2–4 lines per paragraph on desktop |

## 5. Accessibility Rules

| Rank | Requirement |
|---|---|
| 1 | Semantic landmarks for header, main, footer |
| 2 | Visible focus states on all inputs and interactive controls |
| 3 | Button labels reflect action outcome |
| 4 | No color-only status signaling |
| 5 | Minimum body contrast equivalent to dark text on white |
