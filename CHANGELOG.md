# Changelog

All notable changes to this project will be documented in this file.

This project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html) (semver):
- **MAJOR**: Breaking changes (incompatible API/config/plugin changes)
- **MINOR**: Backwards-compatible new features
- **PATCH**: Backwards-compatible bug fixes, docs, or internal improvements

---

### Added
- **Resilience-First Architecture**: Implemented **Hybrid Rendering** across all templates. All dynamic image sections (Stats, Languages, Performance) now include Markdown text/table fallbacks to ensure profile readability during external service outages.
- **Stable Core Metrics**: Shifted total stars, forks, and followers to `shields.io` badges for guaranteed reliability.

### Changed
- **v1.0.0 Aesthetic Finalization**: Comprehensive update to `minimal`, `stats-heavy`, and `showcase` for a professional, "boostfull" look.
- **Interactive Tech Stack**: The CLI now prompts you to enter your favorite tools and frameworks (e.g., `git,react,docker`) during profile generation, ensuring your specific stack is highlighted.
- **Provider Swap**: Replaced `github-readme-stats` with `github-readme-stats-one` to resolve service outages.
- **Frameworks & Tools**: Added a new "Tools & Frameworks" section to `minimal` and `stats-heavy` templates, tailored for standard full-stack profiles.
- **Expanded Languages**: Increased the language count in charts from 6 to 10 for a more comprehensive skill overview.
- **Enhanced Featured Projects**: Upgraded "Featured Projects" section in ALL templates to use visual **Repo Pin Cards** instead of text lists.
- **Dracula Theme Standardization**: Switched all dynamic cards to the high-contrast `dracula` theme for robust visibility across light/dark GitHub modes.
- **Improved Bio Rendering**: Implemented robust sanitization to handle multi-line bios and prevent broken HTML tags.

## [1.0.0] - 2026-01-29

### Added
- Stable, versioned plugin API with runtime validation
- Versioned config schema with migration support
- Predictable plugin enable/disable resolution (CLI > config > default)
- Built-in example plugins: Projects, Stats, Social Links
- Plugin lifecycle enforcement (init → beforeRender → render → afterRender)
- Plugin isolation: errors in one plugin do not affect others
- Performance optimizations for large profiles (caching, lazy execution)
- Complete plugin development documentation and minimal working example
- Strict test coverage for plugin system and lifecycle

### Changed
- All plugin hooks now receive deep copies of data to prevent shared state mutation
- CLI and config precedence for plugin control is explicit and documented

### Breaking Changes
- **Plugin interface is now strictly validated at runtime**
- **Config schema is versioned; old configs are migrated automatically**
- **Plugins must not mutate shared state; hooks receive deep copies only**

### Migration Notes
- Update custom plugins to match the new interface and lifecycle
- Review config files for new plugin enable/disable structure

---

For earlier changes, see commit history.
