import {hasVendorFeatureOnAnyPolicy} from '@libs/PolicyUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy} from '@src/types/onyx';

import type {OnyxCollection} from 'react-native-onyx';

import {useCallback} from 'react';

import useOnyx from './useOnyx';
import usePermissions from './usePermissions';

/**
 * Whether the Vendor column can be shown on Search. Search spans every workspace, so the column is available as soon as
 * any workspace has the vendor feature. Saved column lists outlive the feature, so every reader of the saved list
 * re-checks this, not only the column picker.
 */
function useIsVendorColumnAvailable(): boolean {
    const {isBetaEnabled} = usePermissions();
    const isVendorMatchingBetaEnabled = isBetaEnabled(CONST.BETAS.VENDOR_MATCHING);
    const selector = useCallback((allPolicies: OnyxCollection<Policy>) => hasVendorFeatureOnAnyPolicy(allPolicies, isVendorMatchingBetaEnabled), [isVendorMatchingBetaEnabled]);
    const [isVendorColumnAvailable = false] = useOnyx(ONYXKEYS.COLLECTION.POLICY, {selector});
    return isVendorColumnAvailable;
}

export default useIsVendorColumnAvailable;
