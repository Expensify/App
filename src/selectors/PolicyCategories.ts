import {hasAnyCategoryRules} from '@libs/CategoryUtils';

import type {PolicyCategories} from '@src/types/onyx';

import type {OnyxCollection} from 'react-native-onyx';

const hasAnyCategoryRulesSelector = (policyCategories: OnyxCollection<PolicyCategories>) =>
    Object.values(policyCategories ?? {}).some((categories) => hasAnyCategoryRules(categories ?? undefined));

// eslint-disable-next-line import/prefer-default-export
export {hasAnyCategoryRulesSelector};
