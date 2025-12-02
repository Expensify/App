import React from 'react';
import EmptyStateComponent from '@components/EmptyStateComponent';
import LottieAnimations from '@components/LottieAnimations';
import WorkspaceRowSkeleton from '@components/Skeletons/WorkspaceRowSkeleton';
import useLocalize from '@hooks/useLocalize';
import usePreferredPolicy from '@hooks/usePreferredPolicy';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';
import interceptAnonymousUser from '@libs/interceptAnonymousUser';
import Navigation from '@libs/Navigation/Navigation';
import colors from '@styles/theme/colors';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';

function WorkspacesEmptyStateComponent() {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const StyleUtils = useStyleUtils();
    const {isRestrictedPolicyCreation} = usePreferredPolicy();

    return (
        <EmptyStateComponent
            SkeletonComponent={WorkspaceRowSkeleton}
            headerMediaType={CONST.EMPTY_STATE_MEDIA.ANIMATION}
            headerMedia={LottieAnimations.WorkspacePlanet}
            title={translate('workspace.emptyWorkspace.title')}
            subtitle={translate('workspace.emptyWorkspace.subtitle')}
            titleStyles={styles.pt2}
            headerStyles={[styles.overflowHidden, StyleUtils.getBackgroundColorStyle(colors.pink800), StyleUtils.getHeight(variables.sectionIllustrationHeight)]}
            lottieWebViewStyles={styles.emptyWorkspaceListIllustrationStyle}
            headerContentStyles={styles.emptyWorkspaceListIllustrationStyle}
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

WorkspacesEmptyStateComponent.displayName = 'WorkspacesEmptyStateComponent';
export default WorkspacesEmptyStateComponent;
