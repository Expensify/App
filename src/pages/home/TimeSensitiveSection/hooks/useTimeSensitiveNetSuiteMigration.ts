import useOnyx from '@hooks/useOnyx';

import {isArchivedOrPendingDeletePolicy} from '@libs/PolicyUtils/policyType';

import {shouldShowNetSuiteOAuthMigrationNudge} from '@pages/workspace/accounting/netsuite/utils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

type NetSuiteMigrationPolicy = {
    policyID: string;
    policyName: string;
};

function useTimeSensitiveNetSuiteMigration() {
    const [netSuiteMigrationPolicies] = useOnyx(ONYXKEYS.COLLECTION.POLICY, {
        selector: (allPolicies): NetSuiteMigrationPolicy[] =>
            Object.values(allPolicies ?? {}).flatMap((p) => {
                if (!p || p.role !== CONST.POLICY.ROLE.ADMIN || isArchivedOrPendingDeletePolicy(p) || !shouldShowNetSuiteOAuthMigrationNudge(p, allPolicies)) {
                    return [];
                }
                return [{policyID: p.id, policyName: p.name}];
            }),
    });

    return {netSuiteMigrationPolicies: netSuiteMigrationPolicies ?? CONST.EMPTY_ARRAY};
}

export default useTimeSensitiveNetSuiteMigration;
