import React from 'react';
import Button from '@components/Button';
import ButtonWithDropdownMenu from '@components/ButtonWithDropdownMenu';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import interceptAnonymousUser from '@libs/interceptAnonymousUser';
import Navigation from '@libs/Navigation/Navigation';
import ROUTES from '@src/ROUTES';

type WorkspacesListPageHeaderButtonProps = {
    /** Whether the user is restricted from creating a policy. */
    isRestrictedPolicyCreation: boolean;

    /** Whether the user has any workspaces. */
    hasWorkspaces: boolean;

    /** Whether the user has any domains. */
    hasDomains: boolean;
};

function WorkspacesListPageHeaderButton({isRestrictedPolicyCreation, hasWorkspaces, hasDomains}: WorkspacesListPageHeaderButtonProps) {
    const icons = useMemoizedLazyExpensifyIcons(['Building', 'Globe', 'Plus'] as const);
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {shouldUseNarrowLayout} = useResponsiveLayout();

    if (isRestrictedPolicyCreation || !hasWorkspaces) {
        return null;
    }

    return !hasDomains ? (
        <Button
            accessibilityLabel={translate('workspace.new.newWorkspace')}
            text={translate('workspace.new.newWorkspace')}
            onPress={() => interceptAnonymousUser(() => Navigation.navigate(ROUTES.WORKSPACE_CONFIRMATION.getRoute(ROUTES.WORKSPACES_LIST.route)))}
            icon={icons.Plus}
            style={shouldUseNarrowLayout && [styles.flexGrow1, styles.mb3]}
        />
    ) : (
        <ButtonWithDropdownMenu
            success={false}
            onPress={() => {}}
            customText={translate('common.new')}
            options={[
                !isRestrictedPolicyCreation
                    ? {
                          value: 'workspace',
                          text: translate('workspace.new.newWorkspace'),
                          icon: icons.Building,
                          onSelected: () => interceptAnonymousUser(() => Navigation.navigate(ROUTES.WORKSPACE_CONFIRMATION.getRoute(ROUTES.WORKSPACES_LIST.route))),
                      }
                    : undefined,
                {
                    value: 'domain',
                    text: translate('domain.addDomain.newDomain'),
                    icon: icons.Globe,
                    onSelected: () => interceptAnonymousUser(() => Navigation.navigate(ROUTES.WORKSPACES_ADD_DOMAIN)),
                },
            ].filter((option) => option !== undefined)}
            isSplitButton={false}
            wrapperStyle={styles.flexGrow1}
            testID="dropdown-button-new"
        />
    );
}

WorkspacesListPageHeaderButton.displayName = 'WorkspacesListPageHeaderButton';

export default WorkspacesListPageHeaderButton;
