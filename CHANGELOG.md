# Changelog

All notable changes to this project will be documented in this file.

This project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html) (semver):
- **MAJOR**: Breaking changes (incompatible API/config/plugin changes)
- **MINOR**: Backwards-compatible new features
- **PATCH**: Backwards-compatible bug fixes, docs, or internal improvements

---

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
