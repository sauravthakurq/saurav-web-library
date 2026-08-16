# Fonts

The page loads **TT Norms Pro** via `@font-face` from:

- `/fonts/tt-norms-pro-regular.woff2` (weight 400)
- `/fonts/tt-norms-pro-semibold.woff2` (weight 600)

TT Norms Pro is a commercial typeface and its files are not committed to this
repo. Drop your licensed `.woff2` files into this folder using the exact names
above and they will be picked up automatically. Until then, `font-display: swap`
ensures the page falls back to the system sans-serif stack.
