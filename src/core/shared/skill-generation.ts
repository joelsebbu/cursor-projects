/**
 * Skill Generation Utilities
 *
 * Shared utilities for generating skill and command files.
 */

import {
  getExploreSkillTemplate,
  getNewChangeSkillTemplate,
  getContinueChangeSkillTemplate,
  getApplyChangeSkillTemplate,
  getUpdateChangeSkillTemplate,
  getFfChangeSkillTemplate,
  getSyncSpecsSkillTemplate,
  getArchiveChangeSkillTemplate,
  getBulkArchiveChangeSkillTemplate,
  getVerifyChangeSkillTemplate,
  getOnboardSkillTemplate,
  getOfsxProposeSkillTemplate,
  getOfsxExploreCommandTemplate,
  getOfsxNewCommandTemplate,
  getOfsxContinueCommandTemplate,
  getOfsxApplyCommandTemplate,
  getOfsxUpdateCommandTemplate,
  getOfsxFfCommandTemplate,
  getOfsxSyncCommandTemplate,
  getOfsxArchiveCommandTemplate,
  getOfsxBulkArchiveCommandTemplate,
  getOfsxVerifyCommandTemplate,
  getOfsxOnboardCommandTemplate,
  getOfsxProposeCommandTemplate,
  type SkillTemplate,
} from '../templates/skill-templates.js';
import type { CommandContent } from '../command-generation/index.js';
import { OPENSPEC_CLI_ALLOWED_TOOLS } from './allowed-tools.js';

/**
 * Skill template with directory name and workflow ID mapping.
 */
export interface SkillTemplateEntry {
  template: SkillTemplate;
  dirName: string;
  workflowId: string;
}

/**
 * Command template with ID mapping.
 */
export interface CommandTemplateEntry {
  template: ReturnType<typeof getOfsxExploreCommandTemplate>;
  id: string;
}

/**
 * Gets skill templates with their directory names, optionally filtered by workflow IDs.
 *
 * @param workflowFilter - If provided, only return templates whose workflowId is in this array
 */
export function getSkillTemplates(workflowFilter?: readonly string[]): SkillTemplateEntry[] {
  const all: SkillTemplateEntry[] = [
    { template: getExploreSkillTemplate(), dirName: 'officespec-explore', workflowId: 'explore' },
    { template: getNewChangeSkillTemplate(), dirName: 'officespec-new-change', workflowId: 'new' },
    { template: getContinueChangeSkillTemplate(), dirName: 'officespec-continue-change', workflowId: 'continue' },
    { template: getApplyChangeSkillTemplate(), dirName: 'officespec-apply-change', workflowId: 'apply' },
    { template: getUpdateChangeSkillTemplate(), dirName: 'officespec-update-change', workflowId: 'update' },
    { template: getFfChangeSkillTemplate(), dirName: 'officespec-ff-change', workflowId: 'ff' },
    { template: getSyncSpecsSkillTemplate(), dirName: 'officespec-sync-specs', workflowId: 'sync' },
    { template: getArchiveChangeSkillTemplate(), dirName: 'officespec-archive-change', workflowId: 'archive' },
    { template: getBulkArchiveChangeSkillTemplate(), dirName: 'officespec-bulk-archive-change', workflowId: 'bulk-archive' },
    { template: getVerifyChangeSkillTemplate(), dirName: 'officespec-verify-change', workflowId: 'verify' },
    { template: getOnboardSkillTemplate(), dirName: 'officespec-onboard', workflowId: 'onboard' },
    { template: getOfsxProposeSkillTemplate(), dirName: 'officespec-propose', workflowId: 'propose' },
  ];

  if (!workflowFilter) return all;

  const filterSet = new Set(workflowFilter);
  return all.filter(entry => filterSet.has(entry.workflowId));
}

/**
 * Gets command templates with their IDs, optionally filtered by workflow IDs.
 *
 * @param workflowFilter - If provided, only return templates whose id is in this array
 */
export function getCommandTemplates(workflowFilter?: readonly string[]): CommandTemplateEntry[] {
  const all: CommandTemplateEntry[] = [
    { template: getOfsxExploreCommandTemplate(), id: 'explore' },
    { template: getOfsxNewCommandTemplate(), id: 'new' },
    { template: getOfsxContinueCommandTemplate(), id: 'continue' },
    { template: getOfsxApplyCommandTemplate(), id: 'apply' },
    { template: getOfsxUpdateCommandTemplate(), id: 'update' },
    { template: getOfsxFfCommandTemplate(), id: 'ff' },
    { template: getOfsxSyncCommandTemplate(), id: 'sync' },
    { template: getOfsxArchiveCommandTemplate(), id: 'archive' },
    { template: getOfsxBulkArchiveCommandTemplate(), id: 'bulk-archive' },
    { template: getOfsxVerifyCommandTemplate(), id: 'verify' },
    { template: getOfsxOnboardCommandTemplate(), id: 'onboard' },
    { template: getOfsxProposeCommandTemplate(), id: 'propose' },
  ];

  if (!workflowFilter) return all;

  const filterSet = new Set(workflowFilter);
  return all.filter(entry => filterSet.has(entry.id));
}

/**
 * Converts command templates to CommandContent array, optionally filtered by workflow IDs.
 *
 * @param workflowFilter - If provided, only return contents whose id is in this array
 */
export function getCommandContents(workflowFilter?: readonly string[]): CommandContent[] {
  const commandTemplates = getCommandTemplates(workflowFilter);
  return commandTemplates.map(({ template, id }) => ({
    id,
    name: template.name,
    description: template.description,
    category: template.category,
    tags: template.tags,
    body: template.content,
  }));
}

/**
 * Generates skill file content with YAML frontmatter.
 *
 * @param template - The skill template
 * @param generatedByVersion - The OfficeSpec version to embed in the file
 * @param transformInstructions - Optional callback to transform the instructions content
 */
export function generateSkillContent(
  template: SkillTemplate,
  generatedByVersion: string,
  transformInstructions?: (instructions: string) => string
): string {
  const instructions = transformInstructions
    ? transformInstructions(template.instructions)
    : template.instructions;

  return `---
name: ${template.name}
description: ${template.description}
allowed-tools: ${OPENSPEC_CLI_ALLOWED_TOOLS}
license: ${template.license || 'MIT'}
compatibility: ${template.compatibility || 'Requires openspec CLI.'}
metadata:
  author: ${template.metadata?.author || 'openspec'}
  version: "${template.metadata?.version || '1.0'}"
  generatedBy: "${generatedByVersion}"
---

${instructions}
`;
}
