import type {ImageContentFit} from 'expo-image';
import React, {useLayoutEffect} from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import FocusableMenuItem from '@components/FocusableMenuItem';
import useLocalize from '@hooks/useLocalize';
import useMappedPolicies from '@hooks/useMappedPolicies';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import usePreferredPolicy from '@hooks/usePreferredPolicy';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import interceptAnonymousUser from '@libs/interceptAnonymousUser';
import Navigation from '@libs/Navigation/Navigation';
import {shouldShowPolicy} from '@libs/PolicyUtils';
import {useFABMenuContext} from '@pages/inbox/sidebar/FABPopoverContent/FABMenuContext';
import type {MenuItemIcons} from '@pages/inbox/sidebar/FABPopoverContent/types';
import {policyMapper} from '@pages/inbox/sidebar/FABPopoverContent/types';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type * as OnyxTypes from '@src/types/onyx';

const ITEM_ID = 'new-workspace';

type NewWorkspaceMenuItemProps = {
    icons: MenuItemIcons;
};

function NewWorkspaceMenuItem({icons}: NewWorkspaceMenuItemProps) {
    const {translate} = useLocalize();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const {isOffline} = useNetwork();
    const [isLoading = false] = useOnyx(ONYXKEYS.IS_LOADING_APP, {canBeMissing: true});
    const [session] = useOnyx(ONYXKEYS.SESSION, {canBeMissing: false});
    const [allPolicies] = useMappedPolicies(policyMapper);
    const {isRestrictedPolicyCreation} = usePreferredPolicy();
    const {focusedIndex, setFocusedIndex, onItemPress, registeredItems, registerItem, unregisterItem} = useFABMenuContext();
    const StyleUtils = useStyleUtils();
    const theme = useTheme();

    const shouldShowNewWorkspaceButton = (() => {
        if (isRestrictedPolicyCreation) {
            return false;
        }
        const isOfflineBool = !!isOffline;
        const email = session?.email;
        return Object.values(allPolicies ?? {}).every((policy) => !shouldShowPolicy(policy as OnyxEntry<OnyxTypes.Policy>, isOfflineBool, email));
    })();

    const isVisible = !isLoading && shouldShowNewWorkspaceButton;

    useLayoutEffect(() => {
        if (!isVisible) {
            return;
        }
        registerItem(ITEM_ID);
        return () => unregisterItem(ITEM_ID);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isVisible]);

    const itemIndex = registeredItems.indexOf(ITEM_ID);

    if (!isVisible) {
        return null;
    }

    return (
        <FocusableMenuItem
            pressableTestID={CONST.SENTRY_LABEL.FAB_MENU.NEW_WORKSPACE}
            displayInDefaultIconColor
            contentFit={'contain' as ImageContentFit}
            icon={icons.NewWorkspace}
            iconWidth={variables.w46}
            iconHeight={variables.h40}
            title={translate('workspace.new.newWorkspace')}
            description={translate('workspace.new.getTheExpensifyCardAndMore')}
            focused={focusedIndex === itemIndex}
            onFocus={() => setFocusedIndex(itemIndex)}
            onPress={() =>
                onItemPress(() => interceptAnonymousUser(() => Navigation.navigate(ROUTES.WORKSPACE_CONFIRMATION.getRoute(Navigation.getActiveRoute()))), {
                    shouldCallAfterModalHide: shouldUseNarrowLayout,
                })
            }
            shouldCheckActionAllowedOnPress={false}
            role={CONST.ROLE.BUTTON}
            wrapperStyle={StyleUtils.getItemBackgroundColorStyle(false, focusedIndex === itemIndex, false, theme.activeComponentBG, theme.hoverComponentBG)}
        />
    );
}

export default NewWorkspaceMenuItem;
