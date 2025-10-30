import React from 'react';
import useLocalize from '@hooks/useLocalize';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';
import interceptAnonymousUser from '@libs/interceptAnonymousUser';
import Navigation from '@libs/Navigation/Navigation';
import colors from '@styles/theme/colors';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import EmptyStateComponent from './EmptyStateComponent';
import LottieAnimations from './LottieAnimations';
import WorkspaceRowSkeleton from './Skeletons/WorkspaceRowSkeleton';

function WorkspacesEmptyStateComponent() {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const StyleUtils = useStyleUtils();

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
            buttons={[
                {
                    success: true,
                    buttonAction: () => interceptAnonymousUser(() => Navigation.navigate(ROUTES.WORKSPACE_CONFIRMATION.getRoute(ROUTES.WORKSPACES_LIST.route))),
                    buttonText: translate('workspace.new.newWorkspace'),
                },
            ]}
        />
    );
}

WorkspacesEmptyStateComponent.displayName = 'WorkspacesEmptyStateComponent';
export default WorkspacesEmptyStateComponent;
