/**
 * Agent Skill Templates
 *
 * Compatibility facade that re-exports split workflow template modules.
 */

export type { SkillTemplate, CommandTemplate } from './types.js';

export { getExploreSkillTemplate, getOfsxExploreCommandTemplate } from './workflows/explore.js';
export { getNewChangeSkillTemplate, getOfsxNewCommandTemplate } from './workflows/new-change.js';
export { getContinueChangeSkillTemplate, getOfsxContinueCommandTemplate } from './workflows/continue-change.js';
export { getApplyInstructions, getApplyChangeSkillTemplate, getOfsxApplyCommandTemplate } from './workflows/apply-change.js';
export { getUpdateChangeSkillTemplate, getOfsxUpdateCommandTemplate } from './workflows/update-change.js';
export { getFfChangeSkillTemplate, getOfsxFfCommandTemplate } from './workflows/ff-change.js';
export { getSyncSpecsSkillTemplate, getOfsxSyncCommandTemplate } from './workflows/sync-specs.js';
export { getArchiveChangeSkillTemplate, getOfsxArchiveCommandTemplate } from './workflows/archive-change.js';
export { getBulkArchiveChangeSkillTemplate, getOfsxBulkArchiveCommandTemplate } from './workflows/bulk-archive-change.js';
export { getVerifyChangeSkillTemplate, getOfsxVerifyCommandTemplate } from './workflows/verify-change.js';
export { getOnboardSkillTemplate, getOfsxOnboardCommandTemplate } from './workflows/onboard.js';
export { getOfsxProposeSkillTemplate, getOfsxProposeCommandTemplate } from './workflows/propose.js';
export { getFeedbackSkillTemplate } from './workflows/feedback.js';
