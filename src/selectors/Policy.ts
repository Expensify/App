import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';
import CONST from '@src/CONST';
import type {Policy, PolicyReportField} from '@src/types/onyx';
import mapOnyxCollectionItems from '@src/utils/mapOnyxCollectionItems';

type PolicySelector<T> = (policy: OnyxEntry<Policy>) => T;

const createPoliciesSelector = <T>(policies: OnyxCollection<Policy>, policySelector: PolicySelector<T>) => mapOnyxCollectionItems(policies, policySelector);

const activePolicySelector = (policy: OnyxEntry<Policy>) => (policy?.type !== CONST.POLICY.TYPE.PERSONAL ? policy : undefined);

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

export {activePolicySelector, createPoliciesSelector, createAllPolicyReportFieldsSelector};
