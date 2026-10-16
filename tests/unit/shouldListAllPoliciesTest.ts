import {shouldListAllPolicies} from '@hooks/useOutstandingReports';

import CONST from '@src/CONST';

import {createRandomReport} from '../utils/collections/reports';

describe('shouldListAllPolicies', () => {
    const personalPolicyID = 'personal';
    const workspacePolicyID = 'workspace';

    it('lists every workspace when no workspace is selected', () => {
        expect(shouldListAllPolicies(undefined, personalPolicyID, undefined)).toBe(true);
    });

    it('lists every workspace when the selected policy is the personal one', () => {
        expect(shouldListAllPolicies(personalPolicyID, personalPolicyID, undefined)).toBe(true);
    });

    it('lists every workspace when the selected report is the self DM', () => {
        const selfDM = createRandomReport(1, CONST.REPORT.CHAT_TYPE.SELF_DM);

        expect(shouldListAllPolicies(workspacePolicyID, personalPolicyID, selfDM)).toBe(true);
    });

    it('lists only the selected workspace otherwise', () => {
        expect(shouldListAllPolicies(workspacePolicyID, personalPolicyID, createRandomReport(1, undefined))).toBe(false);
    });
});
