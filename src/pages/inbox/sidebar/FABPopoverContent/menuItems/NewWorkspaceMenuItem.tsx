import type {ImageContentFit} from 'expo-image';
import React from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useMappedPolicies from '@hooks/useMappedPolicies';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import usePreferredPolicy from '@hooks/usePreferredPolicy';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import interceptAnonymousUser from '@libs/interceptAnonymousUser';
import Navigation from '@libs/Navigation/Navigation';
import {shouldShowPolicy} from '@libs/PolicyUtils';
import FABFocusableMenuItem from '@pages/inbox/sidebar/FABPopoverContent/FABFocusableMenuItem';
import {policyMapper} from '@pages/inbox/sidebar/FABPopoverContent/useRedirectToExpensifyClassic';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import {emailSelector} from '@src/selectors/Session';
import type * as OnyxTypes from '@src/types/onyx';

const ITEM_ID = CONST.FAB_MENU_ITEM_IDS.NEW_WORKSPACE;

function NewWorkspaceMenuItem() {
    const {translate} = useLocalize();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const icons = useMemoizedLazyExpensifyIcons(['NewWorkspace'] as const);
    const {isOffline} = useNetwork();
    const [isLoading = false] = useOnyx(ONYXKEYS.IS_LOADING_APP);
    const [sessionEmail] = useOnyx(ONYXKEYS.SESSION, {selector: emailSelector});
    const [allPolicies] = useMappedPolicies(policyMapper);
    const {isRestrictedPolicyCreation} = usePreferredPolicy();
    const shouldShowNewWorkspaceButton =
        !isRestrictedPolicyCreation && Object.values(allPolicies ?? {}).every((policy) => !shouldShowPolicy(policy as OnyxEntry<OnyxTypes.Policy>, !!isOffline, sessionEmail));

    const isVisible = !isLoading && shouldShowNewWorkspaceButton;

    return (
        <FABFocusableMenuItem
            itemId={ITEM_ID}
            isVisible={isVisible}
            pressableTestID={CONST.SENTRY_LABEL.FAB_MENU.NEW_WORKSPACE}
            displayInDefaultIconColor
            contentFit={'contain' as ImageContentFit}
            icon={icons.NewWorkspace}
            iconWidth={variables.w46}
            iconHeight={variables.h40}
            title={translate('workspace.new.newWorkspace')}
            description={translate('workspace.new.getTheExpensifyCardAndMore')}
            onPress={() => interceptAnonymousUser(() => Navigation.navigate(ROUTES.WORKSPACE_CONFIRMATION.getRoute(Navigation.getActiveRoute())))}
            shouldCallAfterModalHide={shouldUseNarrowLayout}
        />
    );
}

export default NewWorkspaceMenuItem;
