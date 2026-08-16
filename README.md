# Saurav Web Library

A curated collection of **144 web projects** spanning hero sections, landing pages, animations, portfolios, UI components, design systems, and full templates.

## Categories

| Category | Count | Description |
|----------|-------|-------------|
| [Hero Sections](hero-sections/) | 19 | Standalone hero section designs |
| [Landing Pages](landing-pages/) | 59 | Complete landing page layouts |
| [Animations & Loaders](animations-loaders/) | 5 | Animation effects and loading sequences |
| [Portfolios](portfolios/) | 6 | Portfolio and press kit designs |
| [Components & UI](components-ui/) | 3 | Reusable UI components |
| [UI Design](ui-design/) | 6 | Design system showcases |
| [Templates](templates/) | 46 | Full website and SaaS templates |

## Browsing the Projects

Each project lives in its own directory under the appropriate category:

```
saurav-web-library/
├── hero-sections/
│   └── convix-pr-agency-hero/
├── landing-pages/
│   └── pelmatech-health-companion/
├── animations-loaders/
│   └── microvisuals-boomerang-hero/
├── portfolios/
│   └── michael-smith-portfolio/
├── components-ui/
│   └── aurora-sign-up/
├── ui-design/
│   └── bauhaus-form-follows-function/
├── templates/
│   └── scalar/
└── projects.json
```

A machine-readable index of all projects is available in [`projects.json`](projects.json).

## Running Individual Projects

Most projects are self-contained web projects. To run one:

1. Navigate into the project directory:
   ```bash
   cd hero-sections/convix-pr-agency-hero
   ```

2. If the project has a `package.json`:
   ```bash
   npm install
   npm run dev
   ```

3. If the project is a static HTML project, open `index.html` directly in a browser or use a local server:
   ```bash
   npx serve .
   ```

Check each project's own `README.md` or `prompt.md` for specific instructions.

## Source & Attribution

These projects were originally created as part of the [Saurav Web Library](https://github.com/sauravthakurq/saurav-web-library) by [Saurav Thakur](https://github.com/sauravthakurq). This repository is a curated selection from that collection.

The original projects were generated using AI tools and are shared under the MIT License.

## License

This repository includes projects from [sauravthakurq/saurav-web-library](https://github.com/sauravthakurq/saurav-web-library), licensed under the [MIT License](LICENSE).

```
MIT License
Copyright (c) 2026 Pulkit
```

See the [LICENSE](LICENSE) file for the full license text.
