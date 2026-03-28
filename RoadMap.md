# gh-profile Roadmap

gh-profile is an open-source tool for generating clean, customizable GitHub profile READMEs using a CLI-first approach, with plans for a web-based UI.

This roadmap outlines the current direction of the project and how contributors can get involved.

---

## 🎯 Project Goal

Make it easy for developers to generate and maintain high-quality GitHub profile READMEs using:
- A CLI for power users
- Templates for different developer personas
- A plugin system for extensibility
- A future web UI for non-CLI users

---

## ✅ Completed

### v0.1.0
- CLI-based GitHub profile README generator
- Minimal, readable default template
- Fetches public repositories by default
- Optional GitHub token support to include private repositories
- Contributor-ready codebase setup

---

## ✅ Completed

### v0.2.0 (CLI Enhancements)
- Multiple built-in templates (minimal, showcase, stats-heavy)
- Template selection via CLI flags
- Improved CLI UX and error handling
- Config file support (`gh-profile.config.json`)
- Better README output formatting

---

## ✅ Completed

### v0.3.0 (Template System)
- Template registry (local templates)
- Template cate`gories (developer, designer, founder, etc.)
- CLI preview for templates
- Documentation for creating custom templates

---

## ✅ Completed

### v0.4.0 (Plugin Architecture)
- Plugin-based sections (projects, stats, socials, highlights)
- Enable/disable plugins via CLI or config file
- Plugin lifecycle hooks
- Official plugin development guide
- Example plugins included in repo

---
##  ✅ Completed

### v1.0.0 (Stable CLI Release)
- Stable plugin API
- Backward-compatible config schema
- Improved performance for large GitHub profiles
- Comprehensive documentation
- Versioned releases and changelog

---

### v2.0.0 - Web UI (Planned)

#### Core
- [ ] Decide tech stack (Next.js)
- [ ] Extract CLI core into a shared `core/` package (so web + CLI stay in sync)

#### UI Features
- [ ] Landing page + profile input
- [ ] Template gallery with live preview
- [ ] Plugin toggles (visual version of your config)
- [ ] Export README + "Copy to GitHub" button

---

## 🤝 How to Contribute

You can help by:
- Adding new templates
- Building plugins
- Improving CLI UX
- Writing documentation
- Reporting bugs or proposing features

Check the Issues tab for `good first issue` and `help wanted` labels.

---

## 📌 Notes

This roadmap may evolve as the project grows. Feedback and discussion are always welcome via GitHub Issues.

Let’s build this in public.
