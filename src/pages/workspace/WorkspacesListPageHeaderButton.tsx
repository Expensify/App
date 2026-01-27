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
    /** Whether the button to add a new workspace should be shown. */
    shouldShowNewWorkspaceButton: boolean;

    /** Whether the button to claim a new domain should be shown. */
    shouldShowNewDomainButton: boolean;
};

function WorkspacesListPageHeaderButton({shouldShowNewWorkspaceButton, shouldShowNewDomainButton}: WorkspacesListPageHeaderButtonProps) {
    const icons = useMemoizedLazyExpensifyIcons(['Building', 'Globe', 'Plus']);
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {shouldUseNarrowLayout} = useResponsiveLayout();

    if (shouldShowNewWorkspaceButton && shouldShowNewDomainButton) {
        return (
            <ButtonWithDropdownMenu
                success={false}
                onPress={() => {}}
                customText={translate('common.new')}
                options={[
                    {
                        value: 'workspace',
                        text: translate('workspace.new.newWorkspace'),
                        icon: icons.Building,
                        onSelected: () => interceptAnonymousUser(() => Navigation.navigate(ROUTES.WORKSPACE_CONFIRMATION.getRoute(Navigation.getActiveRoute()))),
                    },
                    {
                        value: 'domain',
                        text: translate('domain.addDomain.newDomain'),
                        icon: icons.Globe,
                        onSelected: () => interceptAnonymousUser(() => Navigation.navigate(ROUTES.WORKSPACES_ADD_DOMAIN)),
                    },
                ]}
                isSplitButton={false}
                style={shouldUseNarrowLayout && [styles.flexGrow1, styles.mb3]}
                wrapperStyle={styles.flexGrow1}
                testID="dropdown-button-new"
            />
        );
    }

    if (shouldShowNewWorkspaceButton) {
        return (
            <Button
                accessibilityLabel={translate('workspace.new.newWorkspace')}
                text={translate('workspace.new.newWorkspace')}
                onPress={() => interceptAnonymousUser(() => Navigation.navigate(ROUTES.WORKSPACE_CONFIRMATION.getRoute(Navigation.getActiveRoute())))}
                icon={icons.Plus}
                style={shouldUseNarrowLayout && [styles.flexGrow1, styles.mb3]}
            />
        );
    }

    if (shouldShowNewDomainButton) {
        return (
            <Button
                accessibilityLabel={translate('domain.addDomain.newDomain')}
                text={translate('domain.addDomain.newDomain')}
                onPress={() => interceptAnonymousUser(() => Navigation.navigate(ROUTES.WORKSPACES_ADD_DOMAIN))}
                icon={icons.Plus}
                style={shouldUseNarrowLayout && [styles.flexGrow1, styles.mb3]}
            />
        );
    }

    return null;
}

export default WorkspacesListPageHeaderButton;
