import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';
import {getOwnedPaidPolicies, isPolicyAdmin} from '@libs/PolicyUtils';
import CONST from '@src/CONST';
import type {Policy, PolicyReportField} from '@src/types/onyx';
import mapOnyxCollectionItems from '@src/utils/mapOnyxCollectionItems';

type PolicySelector<T> = (policy: OnyxEntry<Policy>) => T;

const createPoliciesSelector = <T>(policies: OnyxCollection<Policy>, policySelector: PolicySelector<T>) => mapOnyxCollectionItems(policies, policySelector);

const activePolicySelector = (policy: OnyxEntry<Policy>) => (policy?.type !== CONST.POLICY.TYPE.PERSONAL ? policy : undefined);

const ownerPoliciesSelector = (policies: OnyxCollection<Policy>, currentUserAccountID: number) => getOwnedPaidPolicies(policies, currentUserAccountID);

const activeAdminPoliciesSelector = (policies: OnyxCollection<Policy>, currentUserAccountLogin: string) => {
    const adminPolicies = Object.values(policies ?? {}).filter(
        (policy): policy is Policy => policy?.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE && isPolicyAdmin(policy, currentUserAccountLogin),
    );
    return adminPolicies;
};

/**
 * Creates a selector that aggregates all non-formula policy report fields from all policies,
 * sorted alphabetically by field key using the provided locale compare function
 */
const createAllPolicyReportFieldsSelector = (policies: OnyxCollection<Policy>, localeCompare: (a: string, b: string) => number) => {
    const allPolicyReportFields = Object.values(policies ?? {}).reduce<Record<string, PolicyReportField>>((acc, policy) => {
        Object.assign(acc, policy?.fieldList ?? {});
        return acc;
    }, {});

    const nonFormulaReportFields = Object.entries(allPolicyReportFields)
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        .filter(([_, value]) => value.type !== CONST.POLICY.DEFAULT_FIELD_LIST_TYPE)
        .sort(([aKey], [bKey]) => localeCompare(aKey, bKey));

    return Object.fromEntries(nonFormulaReportFields);
};

const createPoliciesForDomainCardsSelector = (domainNames: string[]) => {
    const policyIDs = new Set(
        domainNames
            .map((domainName) => domainName.match(CONST.REGEX.EXPENSIFY_POLICY_DOMAIN_NAME)?.[1])
            .filter((policyID): policyID is string => !!policyID)
            .map((policyID) => policyID.toUpperCase()),
    );

    return (policies: OnyxCollection<Policy>) => {
        if (policyIDs.size === 0) {
            return {};
        }

        return Object.entries(policies ?? {}).reduce<NonNullable<OnyxCollection<Policy>>>((acc, [key, policy]) => {
            if (policy?.id && policyIDs.has(policy.id.toUpperCase())) {
                acc[key] = policy;
            }
            return acc;
        }, {});
    };
};

export {activePolicySelector, createPoliciesSelector, createAllPolicyReportFieldsSelector, ownerPoliciesSelector, activeAdminPoliciesSelector, createPoliciesForDomainCardsSelector};
