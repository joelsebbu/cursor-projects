## ADDED Requirements

### Requirement: Repo update redirects from workspace planning homes
The repo-local `openspec update` command SHALL not silently treat a workspace planning home as a repo-local OfficeSpec project.

#### Scenario: Running update from a workspace root
- **GIVEN** the command runs from an OfficeSpec workspace root
- **WHEN** the user runs `openspec update`
- **THEN** OfficeSpec SHALL not generate repo-local project files in the workspace root
- **AND** it SHALL tell the user to run `openspec workspace update`

#### Scenario: Running update from inside a workspace planning directory
- **GIVEN** the command runs from a subdirectory of an OfficeSpec workspace planning home
- **WHEN** the user runs `openspec update`
- **THEN** OfficeSpec SHALL not run repo-local update behavior
- **AND** it SHALL tell the user to run `openspec workspace update`

#### Scenario: Running update from a repo-local project
- **GIVEN** the command runs from inside a repo-local OfficeSpec project
- **WHEN** the user runs `openspec update`
- **THEN** OfficeSpec SHALL preserve existing repo-local update behavior
