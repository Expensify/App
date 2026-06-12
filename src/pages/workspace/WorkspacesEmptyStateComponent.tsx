import React from 'react';
import GenericEmptyStateComponent from '@components/EmptyStateComponent/GenericEmptyStateComponent';
import {useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import usePreferredPolicy from '@hooks/usePreferredPolicy';
import useThemeStyles from '@hooks/useThemeStyles';
import interceptAnonymousUser from '@libs/interceptAnonymousUser';
import Navigation from '@libs/Navigation/Navigation';
import ROUTES from '@src/ROUTES';

function WorkspacesEmptyStateComponent() {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {isRestrictedPolicyCreation} = usePreferredPolicy();
    const illustrations = useMemoizedLazyIllustrations(['PlanetWithMobileApp']);

    const buttons = !isRestrictedPolicyCreation
        ? [
              {
                  success: true,
                  buttonAction: () => interceptAnonymousUser(() => Navigation.navigate(ROUTES.WORKSPACE_CONFIRMATION.getRoute(ROUTES.WORKSPACES_LIST.route))),
                  buttonText: translate('workspace.new.newWorkspace'),
              },
          ]
        : undefined;

    return (
        <GenericEmptyStateComponent
            headerMedia={illustrations.PlanetWithMobileApp}
            headerContentStyles={styles.emptyWorkspaceListStaticIllustrationStyle}
            title={translate('workspace.emptyWorkspace.title')}
            subtitle={translate('workspace.emptyWorkspace.subtitle')}
            titleStyles={styles.pt2}
            headerStyles={styles.emptyStateCardIllustrationContainer}
            buttons={buttons}
            containerStyles={styles.mb10}
        />
    );
}

export default WorkspacesEmptyStateComponent;
