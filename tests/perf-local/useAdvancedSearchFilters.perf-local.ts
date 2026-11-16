import {isPolicyFeatureEnabled} from '@libs/PolicyUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy} from '@src/types/onyx';

import {measureFunction} from 'reassure';

import createCollection from '../utils/collections/createCollection';
import createRandomPolicy from '../utils/collections/policies';

const LARGE_POLICY_COUNT = 50000;

describe('useAdvancedSearchFilters', () => {
    test('policy-derived computation', async () => {
        const policies = createCollection<Policy>(
            (_, index) => `${ONYXKEYS.COLLECTION.POLICY}${index}`,
            (index) => createRandomPolicy(index),
            LARGE_POLICY_COUNT,
        );

        await measureFunction(() => {
            // Optimized: single pass over all policies with early-exit flags
            let areCategoriesEnabled = false;
            let areTagsEnabled = false;
            let areTaxEnabled = false;
            let isAttendeeTrackingEnabled = false;
            let hasReportFields = false;
            let hasAnyTaxRates = false;
            let hasNonPersonalPolicyCategories = false;

            for (const policy of Object.values(policies ?? {})) {
                if (!policy) {
                    continue;
                }
                if (!hasNonPersonalPolicyCategories && policy.type !== CONST.POLICY.TYPE.PERSONAL) {
                    hasNonPersonalPolicyCategories = true;
                }
                if (!areCategoriesEnabled) {
                    areCategoriesEnabled = isPolicyFeatureEnabled(policy, CONST.POLICY.MORE_FEATURES.ARE_CATEGORIES_ENABLED);
                }
                if (!areTagsEnabled) {
                    areTagsEnabled = isPolicyFeatureEnabled(policy, CONST.POLICY.MORE_FEATURES.ARE_TAGS_ENABLED);
                }
                if (!areTaxEnabled) {
                    areTaxEnabled = isPolicyFeatureEnabled(policy, CONST.POLICY.MORE_FEATURES.ARE_TAXES_ENABLED);
                }
                if (!isAttendeeTrackingEnabled) {
                    isAttendeeTrackingEnabled = isPolicyFeatureEnabled(policy, CONST.POLICY.MORE_FEATURES.IS_ATTENDEE_TRACKING_ENABLED);
                }
                if (!hasReportFields) {
                    hasReportFields = Object.values(policy.fieldList ?? {}).some((val) => val.type !== CONST.POLICY.DEFAULT_FIELD_LIST_TYPE);
                }
                if (!hasAnyTaxRates && areTaxEnabled) {
                    hasAnyTaxRates = Object.keys(policy.taxRates?.taxes ?? {}).length > 0;
                }
            }
        });
    });
});
