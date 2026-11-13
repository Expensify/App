import useHasLoggedIntoMobileApp from '@hooks/useHasLoggedIntoMobileApp';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import {usePersonalDetail} from '@hooks/usePersonalDetails';

import createDynamicRoute from '@libs/Navigation/helpers/dynamicRoutesUtils/createDynamicRoute';
import Navigation from '@libs/Navigation/Navigation';
import {isPendingDeletePolicy, isPolicyAdmin, isPolicyOwner} from '@libs/PolicyUtils';

import isWithinGettingStartedPeriod from '@pages/home/GettingStartedSection/utils/isWithinGettingStartedPeriod';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES, {DYNAMIC_ROUTES} from '@src/ROUTES';

import {accountIDSelector} from '@selectors/Session';

import type {GettingStartedItem} from './useGettingStartedItems';

import useAddFirstReceiptItem from './useAddFirstReceiptItem';

/** Builds the Getting started steps for a user who signed up through a workspace invite. */
type UseInviteeGettingStartedItemsResult = {
    /** An invitee who became an admin or owner of any workspace gets the intent-based list instead */
    isMemberWithoutAdminRole: boolean;
    shouldShowSection: boolean;
    addNameItem: GettingStartedItem;
    addFirstReceiptItem: GettingStartedItem;
    downloadAppItem: GettingStartedItem;
};

function useInviteeGettingStartedItems(): UseInviteeGettingStartedItemsResult {
    const {translate} = useLocalize();
    const [currentUserAccountID] = useOnyx(ONYXKEYS.SESSION, {selector: accountIDSelector});
    const [inviteePolicyState] = useOnyx(ONYXKEYS.COLLECTION.POLICY, {
        selector: (policies) => {
            const allPolicies = Object.values(policies ?? {});
            const groupPolicies = allPolicies.filter((item) => !!item && item.type !== CONST.POLICY.TYPE.PERSONAL && !isPendingDeletePolicy(item));
            return {
                // Joining more workspaces later doesn't hide the employee list, because the invite signup already marks the user as new.
                isMemberWithoutAdminRole: groupPolicies.length > 0 && groupPolicies.every((item) => !isPolicyAdmin(item) && !isPolicyOwner(item, currentUserAccountID)),

                // The client has no account creation date, but every account gets its personal policy at signup.
                personalPolicyCreated: allPolicies.find((item) => item?.type === CONST.POLICY.TYPE.PERSONAL)?.created,
            };
        },
    });
    const [hasName] = usePersonalDetail(currentUserAccountID, (personalDetail) => !!personalDetail?.firstName?.trim() || !!personalDetail?.lastName?.trim());
    const {hasLoggedIntoMobileApp, isLastMobileAppLoginLoaded} = useHasLoggedIntoMobileApp();
    const {addFirstReceiptItem, isLoadingTransactions} = useAddFirstReceiptItem();

    const addNameItem: GettingStartedItem = {
        key: 'addName',
        label: translate('homePage.gettingStartedSection.addName'),
        subText: translate('homePage.gettingStartedSection.addNameSubText'),
        isComplete: !!hasName,
        route: ROUTES.SETTINGS_DISPLAY_NAME,
    };
    const downloadAppItem: GettingStartedItem = {
        key: 'downloadApp',
        label: translate('homePage.gettingStartedSection.downloadApp'),
        subText: translate('homePage.gettingStartedSection.downloadAppSubText'),
        isComplete: hasLoggedIntoMobileApp,
        onPress: () => Navigation.navigate(createDynamicRoute(DYNAMIC_ROUTES.APP_DOWNLOAD_LINKS.path)),
    };

    // Wait for completion data so a user who finished every step doesn't see the section flash in on a cold start. The name
    // selector returns a boolean once personal details load, so undefined means they are still loading.
    const isLoadingCompletion = !isLastMobileAppLoginLoaded || hasName === undefined || isLoadingTransactions;
    const areAllStepsComplete = addNameItem.isComplete && addFirstReceiptItem.isComplete && downloadAppItem.isComplete;

    return {
        isMemberWithoutAdminRole: !!inviteePolicyState?.isMemberWithoutAdminRole,

        // The invited workspace can be years old, so the window starts when the invitee's account was created instead.
        shouldShowSection: isWithinGettingStartedPeriod(inviteePolicyState?.personalPolicyCreated) && !isLoadingCompletion && !areAllStepsComplete,
        addNameItem,
        addFirstReceiptItem,
        downloadAppItem,
    };
}

export default useInviteeGettingStartedItems;
