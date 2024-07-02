import type {StackScreenProps} from '@react-navigation/stack';
import React from 'react';
import {View} from 'react-native';
import * as Illustrations from '@components/Icon/Illustrations';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
import type {FullScreenNavigatorParamList} from '@libs/Navigation/types';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import WorkspacePageWithSections from '@pages/workspace/WorkspacePageWithSections';
import CONST from '@src/CONST';
import type SCREENS from '@src/SCREENS';

type WorkspaceExpensifyCardPageProps = StackScreenProps<FullScreenNavigatorParamList, typeof SCREENS.WORKSPACE.EXPENSIFY_CARD>;

function WorkspaceExpensifyCardPage({route}: WorkspaceExpensifyCardPageProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const {isSmallScreenWidth} = useWindowDimensions();

    return (
        <AccessOrNotFoundWrapper
            policyID={route.params.policyID}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_EXPENSIFY_CARDS_ENABLED}
        >
            <WorkspacePageWithSections
                shouldUseScrollView
                icon={Illustrations.HandCard}
                headerText={translate('workspace.common.expensifyCard')}
                route={route}
                guidesCallTaskID={CONST.GUIDES_CALL_TASK_IDS.WORKSPACE_EXPENSIFY_CARD}
                shouldShowOfflineIndicatorInWideScreen
            >
                <View style={[styles.mt3, isSmallScreenWidth ? styles.workspaceSectionMobile : styles.workspaceSection]} />
            </WorkspacePageWithSections>
        </AccessOrNotFoundWrapper>
    );
}

WorkspaceExpensifyCardPage.displayName = 'WorkspaceExpensifyCardPage';

export default WorkspaceExpensifyCardPage;
