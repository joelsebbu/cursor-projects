import { describe, it, expect } from 'vitest';
import {
  getSkillReferenceTransformer,
  getTransformerForTool,
  transformCommandInvocations,
  transformToSkillReferences,
} from '../../src/utils/command-references.js';
import type { CommandInvocation } from '../../src/core/command-generation/invocation.js';
import { getApplyChangeSkillTemplate } from '../../src/core/templates/workflows/apply-change.js';

const FLAT_SLASH: CommandInvocation = { style: 'flat', prefix: '/' };
const FLAT_AT: CommandInvocation = { style: 'flat', prefix: '@' };
const NAMESPACED_SLASH: CommandInvocation = { style: 'namespaced', prefix: '/' };

/** The `/ofsx-<id>` case, which most flat tools use. */
const transformToHyphenCommands = (text: string): string =>
  transformCommandInvocations(text, FLAT_SLASH);

describe('transformCommandInvocations', () => {
  describe('basic transformations', () => {
    it('should transform single command reference', () => {
      expect(transformToHyphenCommands('/ofsx:new')).toBe('/ofsx-new');
    });

    it('should transform multiple command references', () => {
      const input = '/ofsx:new and /ofsx:apply';
      const expected = '/ofsx-new and /ofsx-apply';
      expect(transformToHyphenCommands(input)).toBe(expected);
    });

    it('should transform command reference in context', () => {
      const input = 'Use /ofsx:apply to implement tasks';
      const expected = 'Use /ofsx-apply to implement tasks';
      expect(transformToHyphenCommands(input)).toBe(expected);
    });

    it('should handle backtick-quoted commands', () => {
      const input = 'Run `/ofsx:continue` to proceed';
      const expected = 'Run `/ofsx-continue` to proceed';
      expect(transformToHyphenCommands(input)).toBe(expected);
    });
  });

  describe('edge cases', () => {
    it('should return unchanged text with no command references', () => {
      const input = 'This is plain text without commands';
      expect(transformToHyphenCommands(input)).toBe(input);
    });

    it('should return empty string unchanged', () => {
      expect(transformToHyphenCommands('')).toBe('');
    });

    it('should not transform similar but non-matching patterns', () => {
      const input = '/ops:new opsx: /other:command';
      expect(transformToHyphenCommands(input)).toBe(input);
    });

    it('should handle multiple occurrences on same line', () => {
      const input = '/ofsx:new /ofsx:continue /ofsx:apply';
      const expected = '/ofsx-new /ofsx-continue /ofsx-apply';
      expect(transformToHyphenCommands(input)).toBe(expected);
    });

    it('should leave unknown command references unchanged', () => {
      // Mirrors transformToSkillReferences: an invented id is left as written
      // rather than reshaped into a command that does not exist either.
      const input = 'Try /ofsx:unknown-command here';
      expect(transformToHyphenCommands(input)).toBe(input);
    });

    it('should rewrite only the known id on a mixed line', () => {
      expect(transformToHyphenCommands('/ofsx:apply and /ofsx:bogus')).toBe(
        '/ofsx-apply and /ofsx:bogus'
      );
    });
  });

  describe('multiline content', () => {
    it('should transform references across multiple lines', () => {
      const input = `Use /ofsx:new to start
Then /ofsx:continue to proceed
Finally /ofsx:apply to implement`;
      const expected = `Use /ofsx-new to start
Then /ofsx-continue to proceed
Finally /ofsx-apply to implement`;
      expect(transformToHyphenCommands(input)).toBe(expected);
    });
  });

  describe('all known commands', () => {
    const commands = [
      'new',
      'continue',
      'apply',
      'update',
      'ff',
      'sync',
      'archive',
      'bulk-archive',
      'verify',
      'explore',
      'onboard',
    ];

    for (const cmd of commands) {
      it(`should transform /ofsx:${cmd}`, () => {
        expect(transformToHyphenCommands(`/ofsx:${cmd}`)).toBe(`/ofsx-${cmd}`);
      });
    }
  });

  describe('non-slash prefixes', () => {
    it("spells Amazon Q's prompt library form, replacing the slash", () => {
      // The whole `/ofsx:` is consumed, so no stray slash survives: it is
      // `@ofsx-apply`, never `/@ofsx-apply` or `@/ofsx-apply`.
      expect(transformCommandInvocations('/ofsx:apply', FLAT_AT)).toBe('@ofsx-apply');
      expect(transformCommandInvocations('Run `/ofsx:archive` when done.', FLAT_AT)).toBe(
        'Run `@ofsx-archive` when done.'
      );
    });

    it('leaves unknown ids alone under a non-slash prefix too', () => {
      expect(transformCommandInvocations('/ofsx:apply and /ofsx:bogus', FLAT_AT)).toBe(
        '@ofsx-apply and /ofsx:bogus'
      );
    });

    it('is a no-op for the canonical namespaced slash form', () => {
      const input = 'Use /ofsx:new then /ofsx:apply';
      expect(transformCommandInvocations(input, NAMESPACED_SLASH)).toBe(input);
    });
  });
});

describe('transformToSkillReferences', () => {
  describe('all known commands', () => {
    const mappings: Array<[string, string]> = [
      ['explore', '/officespec-explore'],
      ['new', '/officespec-new-change'],
      ['continue', '/officespec-continue-change'],
      ['apply', '/officespec-apply-change'],
      ['update', '/officespec-update-change'],
      ['ff', '/officespec-ff-change'],
      ['sync', '/officespec-sync-specs'],
      ['archive', '/officespec-archive-change'],
      ['bulk-archive', '/officespec-bulk-archive-change'],
      ['verify', '/officespec-verify-change'],
      ['onboard', '/officespec-onboard'],
      ['propose', '/officespec-propose'],
    ];

    for (const [cmd, skillRef] of mappings) {
      it(`should transform /ofsx:${cmd} to ${skillRef}`, () => {
        expect(transformToSkillReferences(`/ofsx:${cmd}`)).toBe(skillRef);
      });
    }
  });

  describe('basic transformations', () => {
    it('should transform command reference in context', () => {
      const input = 'Use /ofsx:apply to implement tasks';
      const expected = 'Use /officespec-apply-change to implement tasks';
      expect(transformToSkillReferences(input)).toBe(expected);
    });

    it('should transform multiple command references', () => {
      const input = 'Run /ofsx:apply then /ofsx:archive';
      const expected = 'Run /officespec-apply-change then /officespec-archive-change';
      expect(transformToSkillReferences(input)).toBe(expected);
    });

    it('should handle backtick-quoted commands', () => {
      const input = 'Run `/ofsx:continue` to proceed';
      const expected = 'Run `/officespec-continue-change` to proceed';
      expect(transformToSkillReferences(input)).toBe(expected);
    });

    it('should transform references across multiple lines', () => {
      const input = `Use /ofsx:new to start
Then /ofsx:apply to implement`;
      const expected = `Use /officespec-new-change to start
Then /officespec-apply-change to implement`;
      expect(transformToSkillReferences(input)).toBe(expected);
    });
  });

  describe('edge cases', () => {
    it('should return unchanged text with no command references', () => {
      const input = 'This is plain text without commands';
      expect(transformToSkillReferences(input)).toBe(input);
    });

    it('should return empty string unchanged', () => {
      expect(transformToSkillReferences('')).toBe('');
    });

    it('should leave unknown command references unchanged', () => {
      const input = 'Try /ofsx:unknown-command here';
      expect(transformToSkillReferences(input)).toBe(input);
    });

    it('should not transform similar but non-matching patterns', () => {
      const input = '/ops:new opsx: /other:command';
      expect(transformToSkillReferences(input)).toBe(input);
    });

    it('should transform longest matching command (bulk-archive vs archive)', () => {
      const input = '/ofsx:bulk-archive and /ofsx:archive';
      const expected = '/officespec-bulk-archive-change and /officespec-archive-change';
      expect(transformToSkillReferences(input)).toBe(expected);
    });
  });
});

describe('getSkillReferenceTransformer', () => {
  it('uses the default /<name> form for tools without a custom prefix', () => {
    expect(getSkillReferenceTransformer('vibe')).toBe(transformToSkillReferences);
    expect(getSkillReferenceTransformer('hermes')('/ofsx:apply')).toBe('/officespec-apply-change');
  });

  it('uses /skill:<name> for Kimi Code, per its documented invocation syntax', () => {
    const transformer = getSkillReferenceTransformer('kimi');
    expect(transformer('/ofsx:propose')).toBe('/skill:officespec-propose');
    expect(transformer('Run `/ofsx:apply` then /ofsx:archive')).toBe(
      'Run `/skill:officespec-apply-change` then /skill:officespec-archive-change'
    );
    expect(transformer('/ofsx:unknown-command')).toBe('/ofsx:unknown-command');
  });

  it('uses $<name> for direct Codex invocation hints', () => {
    const transformer = getSkillReferenceTransformer('codex');
    expect(transformer('/ofsx:propose')).toBe('$officespec-propose');
    expect(transformer('/ofsx:unknown-command')).toBe('/ofsx:unknown-command');
  });

  it.each(['rovodev', 'codeassistant'])('uses natural-language skill references for %s', (toolId) => {
    const transformer = getSkillReferenceTransformer(toolId);
    expect(transformer('/ofsx:propose')).toBe('the officespec-propose skill');
    expect(transformer('Run `/ofsx:apply` then /ofsx:archive')).toBe(
      'Run `the officespec-apply-change skill` then the officespec-archive-change skill'
    );
    // No `/openspec-*` or other slash-command form is ever emitted.
    expect(transformer('/ofsx:propose')).not.toMatch(/\/openspec-/);
    expect(transformer('/ofsx:unknown-command')).toBe('/ofsx:unknown-command');
  });
});

describe('getTransformerForTool', () => {
  it('selects skill references for skills-only delivery for every tool', () => {
    expect(getTransformerForTool('claude', 'skills', 'adapter-backed', NAMESPACED_SLASH)).toBe(
      transformToSkillReferences
    );
    // hyphen-command tools must not fall back to hyphen commands when no commands are generated
    expect(getTransformerForTool('opencode', 'skills', 'adapter-backed', FLAT_SLASH)).toBe(transformToSkillReferences);
    expect(getTransformerForTool('pi', 'skills', 'adapter-backed', FLAT_SLASH)).toBe(transformToSkillReferences);
    expect(getTransformerForTool('oh-my-pi', 'skills', 'adapter-backed', FLAT_SLASH)).toBe(transformToSkillReferences);
  });

  it('selects skill references for tools without a command surface, regardless of delivery', () => {
    // Tools like Kimi Code or Mistral Vibe have no command adapter, so their
    // skills must never reference /ofsx:* commands that were not generated.
    expect(getTransformerForTool('vibe', 'both', 'none', undefined)).toBe(transformToSkillReferences);
    expect(getTransformerForTool('hermes', 'both', 'none', undefined)).toBe(transformToSkillReferences);
    // Kimi Code documents /skill:<name> invocations (docs/supported-tools.md)
    for (const delivery of ['both', 'commands', 'skills'] as const) {
      const transformer = getTransformerForTool('kimi', delivery, 'none', undefined);
      expect(transformer?.('/ofsx:propose')).toBe('/skill:officespec-propose');
    }
  });

  it('selects hyphen commands for every flat-invocation tool when commands are generated', () => {
    // These tools invoke commands by filename (/ofsx-<id>), so skills must
    // reference the hyphen form their command files actually answer to.
    for (const toolId of ['bob', 'cursor', 'github-copilot', 'oh-my-pi', 'opencode', 'pi', 'qwen'] as const) {
      for (const delivery of ['both', 'commands'] as const) {
        const transformer = getTransformerForTool(toolId, delivery, 'adapter-backed', FLAT_SLASH);
        expect(transformer?.('/ofsx:apply'), `${toolId} ${delivery}`).toBe('/ofsx-apply');
      }
      // ...but must not fall back to hyphen commands when no commands are generated
      expect(getTransformerForTool(toolId, 'skills', 'adapter-backed', FLAT_SLASH)).toBe(transformToSkillReferences);
    }
  });

  it('selects skill references for devin whenever skills are generated', () => {
    // The Devin Local agent has no workflows, so Devin skill bodies and the
    // getting-started hint must name `/openspec-*` skills, which both Devin
    // agents accept. Workflow bodies get the hyphen form from the generator,
    // like every other flat-invocation tool.
    expect(getTransformerForTool('devin', 'both', 'adapter-backed', FLAT_SLASH)).toBe(
      transformToSkillReferences
    );
    expect(getTransformerForTool('devin', 'skills', 'adapter-backed', FLAT_SLASH)).toBe(
      transformToSkillReferences
    );
    // Under commands-only delivery no Devin skills exist to point at, so the
    // hint falls back to the workflow name Devin registers.
    const commandsOnly = getTransformerForTool('devin', 'commands', 'adapter-backed', FLAT_SLASH);
    expect(commandsOnly?.('/ofsx:propose')).toBe('/ofsx-propose');
  });

  it("selects Amazon Q's @-prefixed prompt form when commands are generated", () => {
    // Amazon Q loads .amazonq/prompts/ofsx-<id>.md into its prompt library,
    // which is invoked with @ — it registers no slash command at all.
    for (const delivery of ['both', 'commands'] as const) {
      const transformer = getTransformerForTool('amazon-q', delivery, 'adapter-backed', FLAT_AT);
      expect(transformer?.('/ofsx:apply'), delivery).toBe('@ofsx-apply');
      expect(transformer?.('Run /ofsx:archive next'), delivery).toBe('Run @ofsx-archive next');
    }
    // Skills-only delivery generates no prompt files, so point at the skill.
    expect(getTransformerForTool('amazon-q', 'skills', 'adapter-backed', FLAT_AT)).toBe(
      transformToSkillReferences
    );
  });

  it('selects no transformer for namespaced tools when commands are generated', () => {
    expect(getTransformerForTool('claude', 'both', 'adapter-backed', NAMESPACED_SLASH)).toBeUndefined();
    expect(getTransformerForTool('claude', 'commands', 'adapter-backed', NAMESPACED_SLASH)).toBeUndefined();
  });

  it('selects shared-tree-safe Codex skill references in every delivery mode', () => {
    // Codex needs $<name>, while generic consumers of the same canonical
    // .agents tree need /<name>. Keep both explicit so neither target breaks.
    for (const delivery of ['both', 'commands', 'skills'] as const) {
      const transformer = getTransformerForTool('codex', delivery, 'skills-invocable', undefined);
      expect(transformer?.('/ofsx:propose')).toBe(
        '$officespec-propose (Codex) or /officespec-propose (other agents)'
      );
      expect(transformer?.('Run /ofsx:apply next')).toBe(
        'Run $officespec-apply-change (Codex) or /officespec-apply-change (other agents) next'
      );
    }
  });
});

// Regression for #1153/#1514: the apply skill template must author its
// continue/apply/archive references as canonical /ofsx:* tokens so the
// generator can rewrite them per target. Bare "officespec-continue-change"
// prose is invisible to the transformers, which left skills.sh, Codex, and
// Kimi with dead text and no archive/input invocation after a naive revert.
describe('apply skill template generates valid per-target invocations', () => {
  const skill = getApplyChangeSkillTemplate().instructions;

  it('authors invocation references as transformable /ofsx:* tokens', () => {
    expect(skill).toContain('/ofsx:apply add-auth');
    expect(skill).toContain('suggest using `/ofsx:continue`');
    expect(skill).toContain('archive this change with `/ofsx:archive`');
    // No bare, non-transformable skill-name prose remains.
    expect(skill).not.toContain('suggest using officespec-continue-change');
  });

  const cases = [
    { tool: 'default (skills.sh)', transform: transformToSkillReferences, cont: '/officespec-continue-change', arch: '/officespec-archive-change', apply: '/officespec-apply-change' },
    { tool: 'codex', transform: getSkillReferenceTransformer('codex'), cont: '$officespec-continue-change', arch: '$officespec-archive-change', apply: '$officespec-apply-change' },
    { tool: 'kimi', transform: getSkillReferenceTransformer('kimi'), cont: '/skill:officespec-continue-change', arch: '/skill:officespec-archive-change', apply: '/skill:officespec-apply-change' },
  ];

  for (const { tool, transform, cont, arch, apply } of cases) {
    it(`emits ${tool} skill invocations for continue, apply, and archive`, () => {
      const out = transform(skill);
      expect(out).toContain(cont);
      expect(out).toContain(arch);
      expect(out).toContain(`${apply} add-auth`);
      // No canonical token survives the rewrite.
      expect(out).not.toMatch(/\/ofsx:(continue|apply|archive)/);
    });
  }
});
