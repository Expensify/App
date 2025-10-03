import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';
import CONST from '@src/CONST';
import type {Policy} from '@src/types/onyx';
import mapOnyxCollectionItems from '@src/utils/mapOnyxCollectionItems';

type PolicySelector<T> = (policy: OnyxEntry<Policy>) => T;

const createPoliciesSelector = <T>(policies: OnyxCollection<Policy>, policySelector: PolicySelector<T>) => mapOnyxCollectionItems(policies, policySelector);

const activePolicySelector = (policy: OnyxEntry<Policy>) => (policy?.type !== CONST.POLICY.TYPE.PERSONAL ? policy : undefined);

export {activePolicySelector, createPoliciesSelector};
