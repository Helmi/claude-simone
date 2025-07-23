# Changelog

All notable changes to hello-simone will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.6.1] - 2025-07-22

### Fixed

- Fixed installation error when selecting MCP version
- Corrected package name reference to use the new simone-mcp package

## [0.6.0] - 2025-07-21

### Added

- Initial release of the Simone installer
- Interactive installation wizard for easy setup
- Support for both MCP (Model Context Protocol) and legacy versions
- Automatic platform detection for Windows, macOS, Linux, and WSL
- MCP configuration generator for Claude Desktop integration
- Project directory validation and git repository detection

### Changed

- Simplified installation process - just run `npx hello-simone`
- Legacy version is now the default (use `--mcp` flag for the new version)

## Notes

This installer makes it easy to add Simone to any project. Choose between the stable legacy version or try the new MCP-based version for Claude Desktop integration.