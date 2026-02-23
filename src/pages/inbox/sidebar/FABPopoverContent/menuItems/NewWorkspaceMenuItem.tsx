import type {ImageContentFit} from 'expo-image';
import React, {useMemo} from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import useLocalize from '@hooks/useLocalize';
import useMappedPolicies from '@hooks/useMappedPolicies';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import usePreferredPolicy from '@hooks/usePreferredPolicy';
import interceptAnonymousUser from '@libs/interceptAnonymousUser';
import Navigation from '@libs/Navigation/Navigation';
import {shouldShowPolicy} from '@libs/PolicyUtils';
import FABMenuItem from '@pages/inbox/sidebar/FABPopoverContent/FABMenuItem';
import type {MenuItemIcons} from '@pages/inbox/sidebar/FABPopoverContent/types';
import {policyMapper} from '@pages/inbox/sidebar/FABPopoverContent/types';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type * as OnyxTypes from '@src/types/onyx';

type NewWorkspaceMenuItemProps = {
    shouldUseNarrowLayout: boolean;
    icons: MenuItemIcons;
};

function NewWorkspaceMenuItem({shouldUseNarrowLayout, icons}: NewWorkspaceMenuItemProps) {
    const {translate} = useLocalize();
    const {isOffline} = useNetwork();
    const [isLoading = false] = useOnyx(ONYXKEYS.IS_LOADING_APP, {canBeMissing: true});
    const [session] = useOnyx(ONYXKEYS.SESSION, {canBeMissing: false});
    const [allPolicies] = useMappedPolicies(policyMapper);
    const {isRestrictedPolicyCreation} = usePreferredPolicy();

    const shouldShowNewWorkspaceButton = useMemo(() => {
        if (isRestrictedPolicyCreation) {
            return false;
        }
        const isOfflineBool = !!isOffline;
        const email = session?.email;
        return Object.values(allPolicies ?? {}).every((policy) => !shouldShowPolicy(policy as OnyxEntry<OnyxTypes.Policy>, isOfflineBool, email));
    }, [isRestrictedPolicyCreation, allPolicies, isOffline, session?.email]);

    if (isLoading || !shouldShowNewWorkspaceButton) {
        return null;
    }

    return (
        <FABMenuItem
            registryId={CONST.SENTRY_LABEL.FAB_MENU.NEW_WORKSPACE}
            displayInDefaultIconColor
            contentFit={'contain' as ImageContentFit}
            icon={icons.NewWorkspace}
            iconWidth={variables.w46}
            iconHeight={variables.h40}
            text={translate('workspace.new.newWorkspace')}
            description={translate('workspace.new.getTheExpensifyCardAndMore')}
            shouldCallAfterModalHide={shouldUseNarrowLayout}
            onSelected={() => interceptAnonymousUser(() => Navigation.navigate(ROUTES.WORKSPACE_CONFIRMATION.getRoute(Navigation.getActiveRoute())))}
            sentryLabel={CONST.SENTRY_LABEL.FAB_MENU.NEW_WORKSPACE}
        />
    );
}

export default NewWorkspaceMenuItem;
