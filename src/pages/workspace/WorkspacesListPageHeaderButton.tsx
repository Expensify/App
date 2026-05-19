import React from 'react';
import Button from '@components/Button';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import interceptAnonymousUser from '@libs/interceptAnonymousUser';
import Navigation from '@libs/Navigation/Navigation';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';

type WorkspacesListPageHeaderButtonProps = {
    /** Whether the button to add a new workspace should be shown. */
    shouldShowNewWorkspaceButton: boolean;
};

function WorkspacesListPageHeaderButton({shouldShowNewWorkspaceButton}: WorkspacesListPageHeaderButtonProps) {
    const icons = useMemoizedLazyExpensifyIcons(['Building', 'Globe', 'Plus']);
    const {translate} = useLocalize();

    if (shouldShowNewWorkspaceButton) {
        return (
            <Button
                accessibilityLabel={translate('workspace.new.newWorkspace')}
                text={translate('workspace.new.newWorkspace')}
                sentryLabel={CONST.SENTRY_LABEL.WORKSPACE.LIST.NEW_WORKSPACE_BUTTON}
                onPress={() => interceptAnonymousUser(() => Navigation.navigate(ROUTES.WORKSPACE_CONFIRMATION.getRoute(ROUTES.WORKSPACES_LIST.route)))}
                icon={icons.Plus}
            />
        );
    }

    return null;
}

export default WorkspacesListPageHeaderButton;
