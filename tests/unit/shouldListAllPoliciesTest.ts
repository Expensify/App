import {shouldListAllPolicies} from '@hooks/useOutstandingReports';

import CONST from '@src/CONST';

import {createRandomReport} from '../utils/collections/reports';

describe('shouldListAllPolicies', () => {
    const personalPolicyID = 'personal';
    const workspacePolicyID = 'workspace';

    it('lists every workspace when no workspace is selected', () => {
        // Given no selected workspace
        // When deciding the scope
        const result = shouldListAllPolicies(undefined, personalPolicyID, undefined);

        // Then every workspace is listed
        expect(result).toBe(true);
    });

    it('lists every workspace when the selected policy is the personal one', () => {
        // Given the personal policy is selected
        // When deciding the scope
        const result = shouldListAllPolicies(personalPolicyID, personalPolicyID, undefined);

        // Then every workspace is listed
        expect(result).toBe(true);
    });

    it('lists every workspace when the selected report is the self DM', () => {
        // Given a workspace is selected along with the self DM
        const selfDM = createRandomReport(1, CONST.REPORT.CHAT_TYPE.SELF_DM);

        // When deciding the scope
        const result = shouldListAllPolicies(workspacePolicyID, personalPolicyID, selfDM);

        // Then every workspace is listed
        expect(result).toBe(true);
    });

    it('lists only the selected workspace otherwise', () => {
        // Given a workspace and a regular report are selected
        // When deciding the scope
        const result = shouldListAllPolicies(workspacePolicyID, personalPolicyID, createRandomReport(1, undefined));

        // Then only that workspace is listed
        expect(result).toBe(false);
    });
});
