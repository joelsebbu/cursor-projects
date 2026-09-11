# Context Store As Standalone OfficeSpec Root Spec

## Outcome

`context-store setup` and `context-store register` treat a context store as a
normal standalone OfficeSpec root with a thin identity file.

After setup or registration, the durable planning state lives in normal
OfficeSpec artifacts: config, specs, changes, and archived changes. The
`.openspec-store/` directory remains identity or local registry metadata, not a
separate planning model.

The existing beta context-store, initiative, and workspace shapes are not a
compatibility contract. This slice ignores old beta files unless they are the
thin `.openspec-store/store.yaml` identity file used by the new model.

## User Experience

A human or agent can create or register a standalone OfficeSpec repo and then see
the same root shape they would expect from a normal OfficeSpec project:

```text
context-store-root/
  .openspec-store/
    store.yaml
  openspec/
    config.yaml
    specs/
    changes/
      archive/
```

The command output and help point users toward normal OfficeSpec specs and
changes, not initiatives, workspace-owned planning, generated agent files, or
collection-specific state.

In plain terms:

```text
context store = normal OfficeSpec root + .openspec-store/store.yaml
```

## Scope

In scope:

- Root shape parity for `context-store setup` and `context-store register`.
- Default config creation during setup.
- Safe handling of missing, empty, Git-only, and existing healthy OfficeSpec-root
  directories.
- Registering cloned or existing context stores on the local machine.
- Turning a healthy standalone OfficeSpec root into a context store only after
  clear user confirmation.
- Separate `context-store doctor` reporting for OfficeSpec-root health.
- Tests that verify setup, register, doctor, idempotency for the new model, and
  unsafe-folder behavior.

Out of scope:

- Store selectors for core lifecycle commands.
- Creating initiative links or initiative collections.
- Workspace-owned planning behavior.
- Agent/tool installation, generated commands, migration, or onboarding flows.
- Clone, pull, push, sync, branch, worktree, dashboard, apply, verify, or archive
  orchestration.
- Migrating, preserving, or cleaning up old beta context-store, initiative, or
  workspace file shapes.
- Public terminology cleanup or broad documentation rewrites.

## Acceptance Criteria

### Setup Ensures A Normal Root

`context-store setup` creates or preserves a healthy OfficeSpec root. A healthy
OfficeSpec root contains `openspec/`, a config file
(`openspec/config.yaml` or `openspec/config.yml`), `openspec/specs/`,
`openspec/changes/`, and `openspec/changes/archive/`.

When setup creates a config file, it creates `openspec/config.yaml` with the
default `spec-driven` schema.

#### Scenario: Setting Up A Missing Or Empty Store

- **GIVEN** a missing directory or empty directory
- **WHEN** the user runs `context-store setup`
- **THEN** OfficeSpec leaves the directory with `.openspec-store/store.yaml`
- **AND** `openspec/config.yaml` exists with the default `spec-driven` schema
- **AND** `openspec/specs/`, `openspec/changes/`, and
  `openspec/changes/archive/` exist
- **AND** JSON output reports the relative paths created by the operation in
  `created_files`

#### Scenario: Accepting A Git-Only Directory

- **GIVEN** an existing directory that contains only `.git/`
- **WHEN** the user runs `context-store setup`
- **THEN** OfficeSpec treats the directory as a safe fresh store
- **AND** OfficeSpec preserves `.git/`
- **AND** OfficeSpec creates the context-store identity metadata and healthy
  OfficeSpec root

#### Scenario: Preserving An Existing Healthy Root

- **GIVEN** an initialized standalone OfficeSpec root
- **WHEN** the user runs `context-store setup`
- **THEN** OfficeSpec preserves existing config, specs, changes, and archived
  changes
- **AND** OfficeSpec creates `.openspec-store/store.yaml` when identity metadata
  is missing

#### Scenario: Creating Default Config Non-Interactively

- **GIVEN** setup runs in non-interactive or JSON mode without tool selection
- **AND** no `openspec/config.yaml` or `openspec/config.yml` exists
- **WHEN** setup completes successfully
- **THEN** `openspec/config.yaml` exists with the default `spec-driven` schema

#### Scenario: Preserving Existing Config

- **GIVEN** `openspec/config.yaml` or `openspec/config.yml` already exists
- **WHEN** setup completes successfully
- **THEN** OfficeSpec preserves the existing config file

#### Scenario: Rejecting Unsafe Folders

- **GIVEN** an arbitrary non-empty unmarked folder
- **WHEN** the user runs `context-store setup`
- **THEN** OfficeSpec rejects it without treating it as a store root
- **AND** it does not create context-store metadata or OfficeSpec-root files in
  that folder

#### Scenario: Rejecting Nested Git Setup Paths

- **GIVEN** a setup target path inside another Git repository
- **WHEN** the user runs `context-store setup`
- **THEN** OfficeSpec rejects the path as unsafe for this slice
- **AND** it does not create context-store metadata or OfficeSpec-root files in
  that path

### Register Requires An Existing Root

`context-store register` remembers a local clone or existing local root on this
machine. It does not initialize planning files.

#### Scenario: Registering A Cloned Context Store

- **GIVEN** an existing healthy OfficeSpec root with `.openspec-store/store.yaml`
- **WHEN** the user runs `context-store register`
- **THEN** OfficeSpec registers it
- **AND** OfficeSpec writes local registry state only when needed
- **AND** OfficeSpec does not create or rewrite OfficeSpec planning files

#### Scenario: Turning A Healthy Root Into A Context Store

- **GIVEN** an existing healthy OfficeSpec root without `.openspec-store/store.yaml`
- **WHEN** the user runs `context-store register`
- **THEN** OfficeSpec asks whether to turn the root into the named context store
- **AND** if the user confirms, OfficeSpec creates `.openspec-store/store.yaml`
  and registers the store locally
- **AND** if the user declines, OfficeSpec does not write metadata or registry
  state

#### Scenario: Refusing Unconfirmed Non-Interactive Conversion

- **GIVEN** an existing healthy OfficeSpec root without `.openspec-store/store.yaml`
- **WHEN** the user runs `context-store register` in non-interactive or JSON mode
  without explicit confirmation
- **THEN** OfficeSpec refuses to convert the root into a context store
- **AND** OfficeSpec does not write metadata or registry state

#### Scenario: Refusing Arbitrary Directories

- **GIVEN** a missing directory, partial OfficeSpec root, or existing directory
  that is not a healthy OfficeSpec root
- **WHEN** the user runs `context-store register`
- **THEN** OfficeSpec refuses to register it
- **AND** OfficeSpec does not silently initialize it as an OfficeSpec root
- **AND** OfficeSpec does not create `.openspec-store/store.yaml` or local
  registry state

### Metadata Stays Thin

Context-store metadata remains identity or registry metadata only.

#### Scenario: Avoiding Old Planning Models In This Slice

- **WHEN** setup or register completes
- **THEN** OfficeSpec does not create initiative links, initiative collections, or
  workspace-owned planning state
- **AND** OfficeSpec does not install generated agent skills, slash commands, or
  tool configuration files into the store
- **AND** OfficeSpec does not run full `openspec init`, tool detection, legacy
  cleanup, migration, skill generation, command generation, or onboarding flows

#### Scenario: Ignoring Old Beta Files

- **GIVEN** a directory contains old beta files such as `initiatives/`,
  `.openspec-workspace/`, `workspace.yaml`, `AGENTS.md`, `.codex/`, `.claude/`,
  or `.cursor/`
- **WHEN** setup or register succeeds for the new model
- **THEN** OfficeSpec ignores those files for this slice
- **AND** OfficeSpec does not migrate, upgrade, delete, or repair those files
- **AND** OfficeSpec does not treat those files as proof that the folder is a
  healthy OfficeSpec root or valid context store
- **AND** OfficeSpec does not preserve old beta planning behavior as a requirement

#### Scenario: Validating Thin Identity Metadata

- **GIVEN** `.openspec-store/store.yaml` exists
- **WHEN** setup, register, or doctor reads it
- **THEN** OfficeSpec treats it as the context-store identity file
- **AND** the file must match the thin identity shape for the new model
- **AND** invalid or mismatched identity metadata is reported as a metadata issue

### Doctor Separates Root Health

`context-store doctor` reports OfficeSpec-root health separately from
context-store metadata and Git health. In JSON output, each store includes a
distinct `openspec_root` section.

#### Scenario: Reporting OfficeSpec Root Health

- **WHEN** doctor inspects a context store
- **THEN** the report covers the `openspec/` directory,
  `openspec/config.yaml` or `openspec/config.yml`, `openspec/specs/`,
  `openspec/changes/`, and `openspec/changes/archive/`
- **AND** root-health issues are distinguishable from metadata and Git issues in
  human and JSON output
- **AND** JSON output includes `openspec_root` separately from `metadata` and
  `git`
- **AND** doctor does not mutate files

#### Scenario: Reporting Without Repairing

- **GIVEN** a registered context store has valid metadata and Git state but is
  missing `openspec/changes/archive/`
- **WHEN** doctor inspects the context store
- **THEN** doctor reports the missing archive directory under `openspec_root`
- **AND** doctor does not create `openspec/changes/archive/`

### Safety, Not Beta Compatibility

This slice protects user-authored files and repeatable command behavior. It does
not treat previous beta context-store behavior as a stable surface.

#### Scenario: Repeating Setup Or Register

- **GIVEN** the same context-store id and path are already registered and the
  OfficeSpec root is healthy
- **WHEN** setup or register runs again for that root
- **THEN** OfficeSpec reports that the store is already registered, already exists,
  or has nothing to change
- **AND** OfficeSpec does not mutate files just to prove the command worked
- **AND** JSON output reports no newly created files for the no-op operation
- **AND** OfficeSpec does not duplicate registry entries

#### Scenario: Preserving User Edits Across Reruns

- **GIVEN** the user edits `openspec/config.yaml` or `openspec/config.yml` after
  setup
- **WHEN** setup or register runs again for that root
- **THEN** OfficeSpec preserves the edited config file
- **AND** OfficeSpec preserves user-authored specs, changes, archived changes, and
  valid identity metadata

#### Scenario: Preserving User Content On Failure

- **GIVEN** setup or register creates files or directories during an operation
- **WHEN** the operation fails before completion
- **THEN** OfficeSpec removes only files and empty directories it created during
  that operation
- **AND** OfficeSpec preserves unrelated user content
