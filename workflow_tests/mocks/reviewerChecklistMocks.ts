/* eslint-disable @typescript-eslint/naming-convention */
import {createMockStep} from '../utils/utils';

// checklist
const REVIEWERCHECKLIST__CHECKLIST__REVIEWERCHECKLIST_JS__STEP_MOCK = createMockStep('reviewerChecklist.js', 'reviewerChecklist.js', 'CHECKLIST', ['GITHUB_TOKEN'], []);
const REVIEWERCHECKLIST__CHECKLIST__STEP_MOCKS = [REVIEWERCHECKLIST__CHECKLIST__REVIEWERCHECKLIST_JS__STEP_MOCK] as const;

export {
    // eslint-disable-next-line import/prefer-default-export
    REVIEWERCHECKLIST__CHECKLIST__STEP_MOCKS,
};
