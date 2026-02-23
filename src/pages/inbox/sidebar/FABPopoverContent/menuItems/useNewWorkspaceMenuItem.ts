import {useMemo} from 'react';
import type {ImageContentFit} from 'expo-image';
import type {OnyxEntry} from 'react-native-onyx';
import type {PopoverMenuItem} from '@components/PopoverMenu';
import useLocalize from '@hooks/useLocalize';
import useMappedPolicies from '@hooks/useMappedPolicies';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import usePreferredPolicy from '@hooks/usePreferredPolicy';
import interceptAnonymousUser from '@libs/interceptAnonymousUser';
import Navigation from '@libs/Navigation/Navigation';
import {shouldShowPolicy} from '@libs/PolicyUtils';
import type {MenuItemIcons} from '@pages/inbox/sidebar/FABPopoverContent/types';
import {policyMapper} from '@pages/inbox/sidebar/FABPopoverContent/types';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type * as OnyxTypes from '@src/types/onyx';

type UseNewWorkspaceMenuItemParams = {
    shouldUseNarrowLayout: boolean;
    icons: MenuItemIcons;
};

function useNewWorkspaceMenuItem({shouldUseNarrowLayout, icons}: UseNewWorkspaceMenuItemParams): PopoverMenuItem[] {
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

    return useMemo(() => {
        if (isLoading || !shouldShowNewWorkspaceButton) {
            return [];
        }
        return [
            {
                displayInDefaultIconColor: true,
                contentFit: 'contain' as ImageContentFit,
                icon: icons.NewWorkspace,
                iconWidth: variables.w46,
                iconHeight: variables.h40,
                text: translate('workspace.new.newWorkspace'),
                description: translate('workspace.new.getTheExpensifyCardAndMore'),
                shouldCallAfterModalHide: shouldUseNarrowLayout,
                onSelected: () => interceptAnonymousUser(() => Navigation.navigate(ROUTES.WORKSPACE_CONFIRMATION.getRoute(Navigation.getActiveRoute()))),
                sentryLabel: CONST.SENTRY_LABEL.FAB_MENU.NEW_WORKSPACE,
            },
        ];
    }, [isLoading, shouldShowNewWorkspaceButton, icons.NewWorkspace, translate, shouldUseNarrowLayout]);
}

export default useNewWorkspaceMenuItem;
