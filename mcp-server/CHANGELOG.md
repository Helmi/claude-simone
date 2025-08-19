# 0.4.0 (2025-08-19)


### Bug Fixes

* add features section to project.yaml.template ([36a75a1](https://github.com/Helmi/claude-simone/commit/36a75a1b5f2ef19ebe8711aaf5dcf076db5fee9e))
* correct markdownlint configuration for VSCode compatibility ([4b790d4](https://github.com/Helmi/claude-simone/commit/4b790d4e9d809a5c61b9771b02ebb93ffdbfa67f))
* correct misleading messages about legacy version stability ([2d972de](https://github.com/Helmi/claude-simone/commit/2d972de6005e672643612a9c92237148bb0cb233))
* correct PROJECT_PATH usage and reorganize Handlebars helpers ([b945612](https://github.com/Helmi/claude-simone/commit/b945612309584de7460fa867ec1756398dfa43dc))
* **docs:** Correct broken links in introduction page ([968cf52](https://github.com/Helmi/claude-simone/commit/968cf52908bcd58ff909e2566739b619aa727772))
* **docs:** Fix broken links in introduction.md to use flat routing structure ([#23](https://github.com/Helmi/claude-simone/issues/23)) ([08764c7](https://github.com/Helmi/claude-simone/commit/08764c7d2304669aedb5d1b05f0e4d54c3f66eb1)), closes [#22](https://github.com/Helmi/claude-simone/issues/22)
* **docs:** Fix remaining broken links in Getting Started section ([f3e07ee](https://github.com/Helmi/claude-simone/commit/f3e07eed87ca89df899f50aa6f9d3f9193817b5d))
* **docs:** Resolve duplicate routes warning at root path ([#32](https://github.com/Helmi/claude-simone/issues/32)) ([3fbabd9](https://github.com/Helmi/claude-simone/commit/3fbabd910528f57e67393cd0f10b0a792e432319)), closes [#24](https://github.com/Helmi/claude-simone/issues/24)
* **docs:** Update baseUrl for GitHub Pages project site ([#28](https://github.com/Helmi/claude-simone/issues/28)) ([a07edeb](https://github.com/Helmi/claude-simone/commit/a07edeba4ed32a93402f954d0f80bc54d5bc09e6))
* grant write permissions to Claude Code Review workflow ([f589550](https://github.com/Helmi/claude-simone/commit/f58955008541752debb0db0806f3de1576ab8ee5))
* **hello-simone:** correct template download issues ([2e48fce](https://github.com/Helmi/claude-simone/commit/2e48fce3eb9cca07a38472c7499a076da7445327))
* integrate linting and type-checking into code review process ([f5a346c](https://github.com/Helmi/claude-simone/commit/f5a346ca114cd31870f436845490fce3c1122d8e)), closes [#9](https://github.com/Helmi/claude-simone/issues/9)
* **mcp-server:** pass features config to Handlebars template context ([#45](https://github.com/Helmi/claude-simone/issues/45)) ([4dfcc0b](https://github.com/Helmi/claude-simone/commit/4dfcc0b6bdfe4b9109490fdbea7a2be4330772bc)), closes [#44](https://github.com/Helmi/claude-simone/issues/44)
* **mcp-server:** standardize configuration file naming to project.yaml ([310d81f](https://github.com/Helmi/claude-simone/commit/310d81f4254b07ffbea866167d068ec326572258))
* **mcp-server:** update create_issue prompt to fetch actual GitHub labels ([#43](https://github.com/Helmi/claude-simone/issues/43)) ([48f2d23](https://github.com/Helmi/claude-simone/commit/48f2d23025308a4c0898495178ccd36cbf7bfea7))
* **mcp:** add missing Handlebars logical helpers (or, and, not) ([b5eb457](https://github.com/Helmi/claude-simone/commit/b5eb457d7bc304fbd88789a1869b2728a34aaac8)), closes [#78](https://github.com/Helmi/claude-simone/issues/78)
* **mcp:** resolve built-in partials path for both dev and production environments ([#77](https://github.com/Helmi/claude-simone/issues/77)) ([e652491](https://github.com/Helmi/claude-simone/commit/e65249179b19d4f2ce77f67830904685fb0679e0)), closes [#74](https://github.com/Helmi/claude-simone/issues/74)
* **prompts:** remove unused project-instructions partial and add PR creation prompt ([a874f82](https://github.com/Helmi/claude-simone/commit/a874f82d21bf0fd92176f9530d4388ee34767c0f))
* **prompts:** update risk variable references to use project.riskLevel ([7993f86](https://github.com/Helmi/claude-simone/commit/7993f86c6ca0d2440517e3c023a73034a2a35a0b))
* remove references to non-existent LONG_TERM_VISION.md ([9cee173](https://github.com/Helmi/claude-simone/commit/9cee173a55581fe4f89398758549c043b65d0387)), closes [#8](https://github.com/Helmi/claude-simone/issues/8)
* resolve ESLint configuration and dependency issues ([#66](https://github.com/Helmi/claude-simone/issues/66)) ([e46ae97](https://github.com/Helmi/claude-simone/commit/e46ae971c3b2310bf9b7ba90f5d0e4d227be410c)), closes [#64](https://github.com/Helmi/claude-simone/issues/64)
* resolve SQLite database lock error with shared connection ([#35](https://github.com/Helmi/claude-simone/issues/35)) ([0b797a6](https://github.com/Helmi/claude-simone/commit/0b797a66b11973bb384505d7de2861112c8cf6ce)), closes [#33](https://github.com/Helmi/claude-simone/issues/33)
* SIMONE_COMMANDS_GUIDE.md ([a5bbe61](https://github.com/Helmi/claude-simone/commit/a5bbe6176cd690e18a346a41fe3ab5a08201e406))
* **tests:** update activity logger tests to check for logError instead of console.error ([#67](https://github.com/Helmi/claude-simone/issues/67)) ([fa81f34](https://github.com/Helmi/claude-simone/commit/fa81f343d5bccca9ef8503ff658204a6266bbee7)), closes [#66](https://github.com/Helmi/claude-simone/issues/66)
* **workflow:** Add write permissions for GitHub Pages deployment ([#26](https://github.com/Helmi/claude-simone/issues/26)) ([56eaf97](https://github.com/Helmi/claude-simone/commit/56eaf9735751f204f1f4cf1d61fd20ec9624f93b))
* **workflow:** Correct branch name for deployment trigger ([70ed7fe](https://github.com/Helmi/claude-simone/commit/70ed7fef3c08a4c258fb30b570e078121fcfe305))


### Features

* add ADR template and improve milestone structure ([740cbda](https://github.com/Helmi/claude-simone/commit/740cbda0d6260fed9b48363f74406c206e31f718))
* add Claude Code post-edit hook for markdown linting ([42ae7e1](https://github.com/Helmi/claude-simone/commit/42ae7e1866e56f224b2c4a21f54a3e8b9c04de73))
* add CLAUDE.md documentation for proper file naming and structure ([9e96e3b](https://github.com/Helmi/claude-simone/commit/9e96e3b20b0ccb43455e2f2af24ba78d129e9e91))
* add generation of mermaid diagrams ([42e7bb2](https://github.com/Helmi/claude-simone/commit/42e7bb237fe57b3c39589bbb70d26eec6c14e390))
* Add GitHub Actions deployment workflow ([870a66a](https://github.com/Helmi/claude-simone/commit/870a66a1266f67856cd3dc1754129a1a86b57bc4))
* add logging for prompt hot-reload debugging ([85bdcbc](https://github.com/Helmi/claude-simone/commit/85bdcbc62e8d1a761c9896d411c14c7f917e830a))
* add mentioned-in-awesome badge ([d58f051](https://github.com/Helmi/claude-simone/commit/d58f051a36347a39c9fff3329ba97b1e27ab0639))
* auto-prepend constitution to all prompts ([cf3c222](https://github.com/Helmi/claude-simone/commit/cf3c222baf14b94c2d29b0a5a8d8e73e15694fe4))
* **documentation:** Initialize Docusaurus documentation site ([baa6e75](https://github.com/Helmi/claude-simone/commit/baa6e751ddc4b0efd9c3783baa610db744269f8d))
* enhance commands with parallel agents and improved workflows ([e353011](https://github.com/Helmi/claude-simone/commit/e353011f7a87f7fb2963be1949760cf5d20aeee4))
* enhance Simone commands with testing support and interactive setup ([90d3b08](https://github.com/Helmi/claude-simone/commit/90d3b0811990bfa47e64e5c264dfe2ae33239703))
* evolve command architecture with enhanced workflow commands ([a2b8bca](https://github.com/Helmi/claude-simone/commit/a2b8bca3a179bdf8eaf882b48522a9f4543dde91))
* **hello-simone:** add npm installer for legacy and MCP versions ([b9a95c1](https://github.com/Helmi/claude-simone/commit/b9a95c1712cf79cafa30afcbb5b3b0a317402e59))
* **hello-simone:** update installer to use simone-mcp@latest with --yes flag ([#46](https://github.com/Helmi/claude-simone/issues/46)) ([208fd2b](https://github.com/Helmi/claude-simone/commit/208fd2ba4bed56e55526a910a84fd2d8929e5c65)), closes [#36](https://github.com/Helmi/claude-simone/issues/36)
* implement header_include partial for auto-including constitution ([557fb65](https://github.com/Helmi/claude-simone/commit/557fb650ae245f926060439303c5281ed95c61ab))
* implement hot-reload with MCP notifications for prompt changes ([1428c65](https://github.com/Helmi/claude-simone/commit/1428c652fa5aaaacba9a5378eb0727e2a5a660a0))
* initial release of Simone project management framework ([89e9f2f](https://github.com/Helmi/claude-simone/commit/89e9f2f7aa3c0bd06fbb9c08d33d424920f1be14))
* **mcp-server:** add architecture and constitution templates ([a15649c](https://github.com/Helmi/claude-simone/commit/a15649c8c56d4f4d067a20d56163188b30493748))
* **mcp-server:** add comprehensive test suite ([26c9931](https://github.com/Helmi/claude-simone/commit/26c9931f86378601443d9bfadc62c16cda332b65)), closes [#21](https://github.com/Helmi/claude-simone/issues/21)
* **mcp-server:** add config-based optional features for git worktree and PR review ([dac6923](https://github.com/Helmi/claude-simone/commit/dac69231a640819f6fa05ca726a61bfc4a540df1)), closes [#29](https://github.com/Helmi/claude-simone/issues/29)
* **mcp-server:** add multi-context tooling support in quality-checks partial ([01f74d0](https://github.com/Helmi/claude-simone/commit/01f74d0efce6d762b72f36c7a670434d2976b9dc))
* **mcp-server:** add optional GitHub Projects integration ([c9b2450](https://github.com/Helmi/claude-simone/commit/c9b24509823b165e55033b0bd1463f6f7dde49af)), closes [#59](https://github.com/Helmi/claude-simone/issues/59)
* **mcp-server:** add refine_pr prompt template ([217ef90](https://github.com/Helmi/claude-simone/commit/217ef9084d902ab2c1ce13e1614673e8467627d3)), closes [#52](https://github.com/Helmi/claude-simone/issues/52)
* **mcp-server:** add risk level and per-context GitHub configuration support ([417a30a](https://github.com/Helmi/claude-simone/commit/417a30ac53160092bda19a28f39cd35864fa3c94))
* **mcp-server:** improve work_issue prompt with git sync and flexibility ([#34](https://github.com/Helmi/claude-simone/issues/34)) ([f55e971](https://github.com/Helmi/claude-simone/commit/f55e971f11384a86e1d62d53506ac177870f6b5f)), closes [#30](https://github.com/Helmi/claude-simone/issues/30)
* **mcp:** Improve work_issue prompt with branch switching and manual testing ([#73](https://github.com/Helmi/claude-simone/issues/73)) ([bf8d5b7](https://github.com/Helmi/claude-simone/commit/bf8d5b750e8ee489fa9a94c45419281e849509da)), closes [#72](https://github.com/Helmi/claude-simone/issues/72) [#72](https://github.com/Helmi/claude-simone/issues/72) [#75](https://github.com/Helmi/claude-simone/issues/75)
* **prompts:** enhance create_prompt with practical guidance and warnings ([45e4480](https://github.com/Helmi/claude-simone/commit/45e4480584711a8323d901c57631330083e632c8))
* publish @helmi74/simone-mcp@0.1.0 to npm ([fedee52](https://github.com/Helmi/claude-simone/commit/fedee52bcec4a036fc08e66ba594cf1276c1b276))
* **simone:** update mermaid command to standard 8-step TODO format ([f01c411](https://github.com/Helmi/claude-simone/commit/f01c411206787455d3c444022dce94f6bd9d32de)), closes [#2](https://github.com/Helmi/claude-simone/issues/2)



# 0.3.0 (2025-07-30)


### Bug Fixes

* add features section to project.yaml.template ([36a75a1](https://github.com/Helmi/claude-simone/commit/36a75a1b5f2ef19ebe8711aaf5dcf076db5fee9e))
* correct markdownlint configuration for VSCode compatibility ([4b790d4](https://github.com/Helmi/claude-simone/commit/4b790d4e9d809a5c61b9771b02ebb93ffdbfa67f))
* correct misleading messages about legacy version stability ([2d972de](https://github.com/Helmi/claude-simone/commit/2d972de6005e672643612a9c92237148bb0cb233))
* correct PROJECT_PATH usage and reorganize Handlebars helpers ([b945612](https://github.com/Helmi/claude-simone/commit/b945612309584de7460fa867ec1756398dfa43dc))
* **docs:** Correct broken links in introduction page ([968cf52](https://github.com/Helmi/claude-simone/commit/968cf52908bcd58ff909e2566739b619aa727772))
* **docs:** Fix broken links in introduction.md to use flat routing structure ([#23](https://github.com/Helmi/claude-simone/issues/23)) ([08764c7](https://github.com/Helmi/claude-simone/commit/08764c7d2304669aedb5d1b05f0e4d54c3f66eb1)), closes [#22](https://github.com/Helmi/claude-simone/issues/22)
* **docs:** Fix remaining broken links in Getting Started section ([f3e07ee](https://github.com/Helmi/claude-simone/commit/f3e07eed87ca89df899f50aa6f9d3f9193817b5d))
* **docs:** Resolve duplicate routes warning at root path ([#32](https://github.com/Helmi/claude-simone/issues/32)) ([3fbabd9](https://github.com/Helmi/claude-simone/commit/3fbabd910528f57e67393cd0f10b0a792e432319)), closes [#24](https://github.com/Helmi/claude-simone/issues/24)
* **docs:** Update baseUrl for GitHub Pages project site ([#28](https://github.com/Helmi/claude-simone/issues/28)) ([a07edeb](https://github.com/Helmi/claude-simone/commit/a07edeba4ed32a93402f954d0f80bc54d5bc09e6))
* grant write permissions to Claude Code Review workflow ([f589550](https://github.com/Helmi/claude-simone/commit/f58955008541752debb0db0806f3de1576ab8ee5))
* **hello-simone:** correct template download issues ([2e48fce](https://github.com/Helmi/claude-simone/commit/2e48fce3eb9cca07a38472c7499a076da7445327))
* integrate linting and type-checking into code review process ([f5a346c](https://github.com/Helmi/claude-simone/commit/f5a346ca114cd31870f436845490fce3c1122d8e)), closes [#9](https://github.com/Helmi/claude-simone/issues/9)
* **mcp-server:** pass features config to Handlebars template context ([#45](https://github.com/Helmi/claude-simone/issues/45)) ([4dfcc0b](https://github.com/Helmi/claude-simone/commit/4dfcc0b6bdfe4b9109490fdbea7a2be4330772bc)), closes [#44](https://github.com/Helmi/claude-simone/issues/44)
* **mcp-server:** standardize configuration file naming to project.yaml ([310d81f](https://github.com/Helmi/claude-simone/commit/310d81f4254b07ffbea866167d068ec326572258))
* **mcp-server:** update create_issue prompt to fetch actual GitHub labels ([#43](https://github.com/Helmi/claude-simone/issues/43)) ([48f2d23](https://github.com/Helmi/claude-simone/commit/48f2d23025308a4c0898495178ccd36cbf7bfea7))
* **prompts:** remove unused project-instructions partial and add PR creation prompt ([a874f82](https://github.com/Helmi/claude-simone/commit/a874f82d21bf0fd92176f9530d4388ee34767c0f))
* **prompts:** update risk variable references to use project.riskLevel ([7993f86](https://github.com/Helmi/claude-simone/commit/7993f86c6ca0d2440517e3c023a73034a2a35a0b))
* remove references to non-existent LONG_TERM_VISION.md ([9cee173](https://github.com/Helmi/claude-simone/commit/9cee173a55581fe4f89398758549c043b65d0387)), closes [#8](https://github.com/Helmi/claude-simone/issues/8)
* resolve ESLint configuration and dependency issues ([#66](https://github.com/Helmi/claude-simone/issues/66)) ([e46ae97](https://github.com/Helmi/claude-simone/commit/e46ae971c3b2310bf9b7ba90f5d0e4d227be410c)), closes [#64](https://github.com/Helmi/claude-simone/issues/64)
* resolve SQLite database lock error with shared connection ([#35](https://github.com/Helmi/claude-simone/issues/35)) ([0b797a6](https://github.com/Helmi/claude-simone/commit/0b797a66b11973bb384505d7de2861112c8cf6ce)), closes [#33](https://github.com/Helmi/claude-simone/issues/33)
* SIMONE_COMMANDS_GUIDE.md ([a5bbe61](https://github.com/Helmi/claude-simone/commit/a5bbe6176cd690e18a346a41fe3ab5a08201e406))
* **tests:** update activity logger tests to check for logError instead of console.error ([#67](https://github.com/Helmi/claude-simone/issues/67)) ([fa81f34](https://github.com/Helmi/claude-simone/commit/fa81f343d5bccca9ef8503ff658204a6266bbee7)), closes [#66](https://github.com/Helmi/claude-simone/issues/66)
* **workflow:** Add write permissions for GitHub Pages deployment ([#26](https://github.com/Helmi/claude-simone/issues/26)) ([56eaf97](https://github.com/Helmi/claude-simone/commit/56eaf9735751f204f1f4cf1d61fd20ec9624f93b))
* **workflow:** Correct branch name for deployment trigger ([70ed7fe](https://github.com/Helmi/claude-simone/commit/70ed7fef3c08a4c258fb30b570e078121fcfe305))


### Features

* add ADR template and improve milestone structure ([740cbda](https://github.com/Helmi/claude-simone/commit/740cbda0d6260fed9b48363f74406c206e31f718))
* add Claude Code post-edit hook for markdown linting ([42ae7e1](https://github.com/Helmi/claude-simone/commit/42ae7e1866e56f224b2c4a21f54a3e8b9c04de73))
* add CLAUDE.md documentation for proper file naming and structure ([9e96e3b](https://github.com/Helmi/claude-simone/commit/9e96e3b20b0ccb43455e2f2af24ba78d129e9e91))
* add generation of mermaid diagrams ([42e7bb2](https://github.com/Helmi/claude-simone/commit/42e7bb237fe57b3c39589bbb70d26eec6c14e390))
* Add GitHub Actions deployment workflow ([870a66a](https://github.com/Helmi/claude-simone/commit/870a66a1266f67856cd3dc1754129a1a86b57bc4))
* add logging for prompt hot-reload debugging ([85bdcbc](https://github.com/Helmi/claude-simone/commit/85bdcbc62e8d1a761c9896d411c14c7f917e830a))
* add mentioned-in-awesome badge ([d58f051](https://github.com/Helmi/claude-simone/commit/d58f051a36347a39c9fff3329ba97b1e27ab0639))
* auto-prepend constitution to all prompts ([cf3c222](https://github.com/Helmi/claude-simone/commit/cf3c222baf14b94c2d29b0a5a8d8e73e15694fe4))
* **documentation:** Initialize Docusaurus documentation site ([baa6e75](https://github.com/Helmi/claude-simone/commit/baa6e751ddc4b0efd9c3783baa610db744269f8d))
* enhance commands with parallel agents and improved workflows ([e353011](https://github.com/Helmi/claude-simone/commit/e353011f7a87f7fb2963be1949760cf5d20aeee4))
* enhance Simone commands with testing support and interactive setup ([90d3b08](https://github.com/Helmi/claude-simone/commit/90d3b0811990bfa47e64e5c264dfe2ae33239703))
* evolve command architecture with enhanced workflow commands ([a2b8bca](https://github.com/Helmi/claude-simone/commit/a2b8bca3a179bdf8eaf882b48522a9f4543dde91))
* **hello-simone:** add npm installer for legacy and MCP versions ([b9a95c1](https://github.com/Helmi/claude-simone/commit/b9a95c1712cf79cafa30afcbb5b3b0a317402e59))
* **hello-simone:** update installer to use simone-mcp@latest with --yes flag ([#46](https://github.com/Helmi/claude-simone/issues/46)) ([208fd2b](https://github.com/Helmi/claude-simone/commit/208fd2ba4bed56e55526a910a84fd2d8929e5c65)), closes [#36](https://github.com/Helmi/claude-simone/issues/36)
* implement header_include partial for auto-including constitution ([557fb65](https://github.com/Helmi/claude-simone/commit/557fb650ae245f926060439303c5281ed95c61ab))
* implement hot-reload with MCP notifications for prompt changes ([1428c65](https://github.com/Helmi/claude-simone/commit/1428c652fa5aaaacba9a5378eb0727e2a5a660a0))
* initial release of Simone project management framework ([89e9f2f](https://github.com/Helmi/claude-simone/commit/89e9f2f7aa3c0bd06fbb9c08d33d424920f1be14))
* **mcp-server:** add architecture and constitution templates ([a15649c](https://github.com/Helmi/claude-simone/commit/a15649c8c56d4f4d067a20d56163188b30493748))
* **mcp-server:** add comprehensive test suite ([26c9931](https://github.com/Helmi/claude-simone/commit/26c9931f86378601443d9bfadc62c16cda332b65)), closes [#21](https://github.com/Helmi/claude-simone/issues/21)
* **mcp-server:** add config-based optional features for git worktree and PR review ([dac6923](https://github.com/Helmi/claude-simone/commit/dac69231a640819f6fa05ca726a61bfc4a540df1)), closes [#29](https://github.com/Helmi/claude-simone/issues/29)
* **mcp-server:** add multi-context tooling support in quality-checks partial ([01f74d0](https://github.com/Helmi/claude-simone/commit/01f74d0efce6d762b72f36c7a670434d2976b9dc))
* **mcp-server:** add optional GitHub Projects integration ([c9b2450](https://github.com/Helmi/claude-simone/commit/c9b24509823b165e55033b0bd1463f6f7dde49af)), closes [#59](https://github.com/Helmi/claude-simone/issues/59)
* **mcp-server:** add refine_pr prompt template by @Swahjak ([217ef90](https://github.com/Helmi/claude-simone/commit/217ef9084d902ab2c1ce13e1614673e8467627d3)), closes [#52](https://github.com/Helmi/claude-simone/issues/52), supersedes [#53](https://github.com/Helmi/claude-simone/issues/53)
* **mcp-server:** add risk level and per-context GitHub configuration support ([417a30a](https://github.com/Helmi/claude-simone/commit/417a30ac53160092bda19a28f39cd35864fa3c94))
* **mcp-server:** improve work_issue prompt with git sync and flexibility ([#34](https://github.com/Helmi/claude-simone/issues/34)) ([f55e971](https://github.com/Helmi/claude-simone/commit/f55e971f11384a86e1d62d53506ac177870f6b5f)), closes [#30](https://github.com/Helmi/claude-simone/issues/30)
* **prompts:** enhance create_prompt with practical guidance and warnings ([45e4480](https://github.com/Helmi/claude-simone/commit/45e4480584711a8323d901c57631330083e632c8))
* publish @helmi74/simone-mcp@0.1.0 to npm ([fedee52](https://github.com/Helmi/claude-simone/commit/fedee52bcec4a036fc08e66ba594cf1276c1b276))
* **simone:** update mermaid command to standard 8-step TODO format ([f01c411](https://github.com/Helmi/claude-simone/commit/f01c411206787455d3c444022dce94f6bd9d32de)), closes [#2](https://github.com/Helmi/claude-simone/issues/2)



# Changelog

All notable changes to the Simone MCP Server will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

> **Note**: This changelog tracks the MCP server implementation only. The legacy Simone command system has its own versioning.

## [Unreleased]

## [0.3.0] - 2025-07-30

### Added

- New `refine_pr` prompt template for pull request refinement workflows by @Swahjak (#63, supersedes #53)
- Optional GitHub Projects integration with project setup and work queue features (#62)
- New `create_idea` prompt for conversational idea capture
- GitHub project operations partial (`github_project.hbs`)
- Comprehensive test suite for MCP server (#64)

### Fixed

- Added missing ESLint dependencies to fix development tooling (#66)

## [0.2.0] - 2025-07-23

### Added

- PR review wait feature that automatically monitors and reports pull request status
- Configurable optional features system allowing users to enable/disable functionality
- Better error handling and retry logic for GitHub API operations

### Changed

- Enhanced work_issue prompt with automatic git synchronization and improved flexibility
- Improved template context handling for more reliable prompt rendering

### Fixed

- SQLite database lock errors by implementing proper connection sharing
- Features configuration not being passed to Handlebars templates correctly
- GitHub label fetching in create_issue prompt now retrieves actual repository labels

### Removed

- Git worktree feature due to incompatibility with Claude's session isolation model

## [0.1.0] - 2025-07-21

### Added

- Activity logging to track your development progress over time
- Smart prompt templates that adapt to your project context
- GitHub integration for managing issues and tasks directly from Claude
- Live template updates - changes take effect without restarting
- Support for multiple project contexts in one workspace

### Changed

- Completely new architecture using Claude's Model Context Protocol (MCP)
- More reliable and faster than the directory-based approach

### Notes

This is the first release of the new MCP-based Simone. It requires Claude Desktop and is available as an npm package (`simone-mcp`).
