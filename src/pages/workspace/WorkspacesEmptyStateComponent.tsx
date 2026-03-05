import React from 'react';
import GenericEmptyStateComponent from '@components/EmptyStateComponent/GenericEmptyStateComponent';
import useLocalize from '@hooks/useLocalize';
import usePreferredPolicy from '@hooks/usePreferredPolicy';
import useThemeStyles from '@hooks/useThemeStyles';
import interceptAnonymousUser from '@libs/interceptAnonymousUser';
import Navigation from '@libs/Navigation/Navigation';
import ROUTES from '@src/ROUTES';
import useWorkspacesEmptyStateIllustration from './useWorkspacesEmptyStateIllustration';

function WorkspacesEmptyStateComponent() {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {isRestrictedPolicyCreation} = usePreferredPolicy();
    const illustration = useWorkspacesEmptyStateIllustration();

    return (
        <GenericEmptyStateComponent
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...illustration}
            title={translate('workspace.emptyWorkspace.title')}
            subtitle={translate('workspace.emptyWorkspace.subtitle')}
            titleStyles={styles.pt2}
            headerStyles={styles.emptyStateCardIllustrationContainer}
            buttons={
                isRestrictedPolicyCreation
                    ? []
                    : [
                          {
                              success: true,
                              buttonAction: () => interceptAnonymousUser(() => Navigation.navigate(ROUTES.WORKSPACE_CONFIRMATION.getRoute(ROUTES.WORKSPACES_LIST.route))),
                              buttonText: translate('workspace.new.newWorkspace'),
                          },
                      ]
            }
        />
    );
}

export default WorkspacesEmptyStateComponent;
