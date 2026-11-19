/**
 * Whether to promote the Approve-only and Guest roles on this workspace. The Members menu badge and the Members page
 * banner share this, so dismissing the banner hides both.
 */
import {canMemberAssignRole} from '@libs/PolicyUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {DismissedProductTraining, Policy} from '@src/types/onyx';

import type {OnyxEntry} from 'react-native-onyx';

import useCurrentUserPersonalDetails from './useCurrentUserPersonalDetails';
import useOnyx from './useOnyx';
import useShouldSuppressPromotionalUI from './useShouldSuppressPromotionalUI';

const isBannerDismissedSelector = (value: OnyxEntry<DismissedProductTraining>): boolean => !!value?.[CONST.NEW_WORKSPACE_ROLES_BANNER];

function useShouldShowNewWorkspaceRolesPromotion(policy: OnyxEntry<Policy>): boolean {
    const {login: currentUserLogin = ''} = useCurrentUserPersonalDetails();
    const shouldSuppressPromotionalUI = useShouldSuppressPromotionalUI();
    const [isDismissed = true] = useOnyx(ONYXKEYS.NVP_DISMISSED_PRODUCT_TRAINING, {selector: isBannerDismissedSelector});

    if (isDismissed || shouldSuppressPromotionalUI) {
        return false;
    }

    return canMemberAssignRole(policy, currentUserLogin, CONST.POLICY.ROLE.APPROVE_ONLY) && canMemberAssignRole(policy, currentUserLogin, CONST.POLICY.ROLE.GUEST);
}

export default useShouldShowNewWorkspaceRolesPromotion;
