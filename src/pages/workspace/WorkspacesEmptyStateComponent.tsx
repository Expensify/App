import React from 'react';
import GenericEmptyStateComponent from '@components/EmptyStateComponent/GenericEmptyStateComponent';
import WorkspaceRowSkeleton from '@components/Skeletons/WorkspaceRowSkeleton';
import useLocalize from '@hooks/useLocalize';
import usePreferredPolicy from '@hooks/usePreferredPolicy';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';
import interceptAnonymousUser from '@libs/interceptAnonymousUser';
import Navigation from '@libs/Navigation/Navigation';
import colors from '@styles/theme/colors';
import variables from '@styles/variables';
import ROUTES from '@src/ROUTES';
import useWorkspacesEmptyStateIllustration from './useWorkspacesEmptyStateIllustration';

function WorkspacesEmptyStateComponent() {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const StyleUtils = useStyleUtils();
    const {isRestrictedPolicyCreation} = usePreferredPolicy();
    const illustration = useWorkspacesEmptyStateIllustration();

    return (
        <GenericEmptyStateComponent
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...illustration}
            SkeletonComponent={WorkspaceRowSkeleton}
            title={translate('workspace.emptyWorkspace.title')}
            subtitle={translate('workspace.emptyWorkspace.subtitle')}
            titleStyles={styles.pt2}
            headerStyles={[styles.overflowHidden, StyleUtils.getBackgroundColorStyle(colors.pink800), StyleUtils.getHeight(variables.sectionIllustrationHeight)]}
            buttons={
                isRestrictedPolicyCreation
                    ? []
                    : [
                          {
                              success: true,
                              buttonAction: () => interceptAnonymousUser(() => Navigation.navigate(ROUTES.WORKSPACE_CONFIRMATION.getRoute(Navigation.getActiveRoute()))),
                              buttonText: translate('workspace.new.newWorkspace'),
                          },
                      ]
            }
        />
    );
}

export default WorkspacesEmptyStateComponent;
