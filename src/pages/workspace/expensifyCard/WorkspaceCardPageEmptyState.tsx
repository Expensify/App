import type {StackScreenProps} from '@react-navigation/stack';
import React from 'react';
import {View} from 'react-native';
import FeatureList from '@components/FeatureList';
import type {FeatureListItem} from '@components/FeatureList';
import * as Illustrations from '@components/Icon/Illustrations';
import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import type {FullScreenNavigatorParamList} from '@libs/Navigation/types';
import WorkspacePageWithSections from '@pages/workspace/WorkspacePageWithSections';
import CONST from '@src/CONST';
import type SCREENS from '@src/SCREENS';

const expensifyCardFeatures: FeatureListItem[] = [
    {
        icon: Illustrations.MoneyReceipts,
        translationKey: 'workspace.moreFeatures.expensifyCard.feed.features.cashBack',
    },
    {
        icon: Illustrations.CreditCardsNew,
        translationKey: 'workspace.moreFeatures.expensifyCard.feed.features.unlimited',
    },
    {
        icon: Illustrations.MoneyWings,
        translationKey: 'workspace.moreFeatures.expensifyCard.feed.features.spend',
    },
];
type WorkspaceCardPageEmptyStateProps = {route: StackScreenProps<FullScreenNavigatorParamList, typeof SCREENS.WORKSPACE.EXPENSIFY_CARD>['route']};

function WorkspaceCardPageEmptyState({route}: WorkspaceCardPageEmptyStateProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const theme = useTheme();
    const {shouldUseNarrowLayout} = useResponsiveLayout();

    return (
        <WorkspacePageWithSections
            shouldUseScrollView
            icon={Illustrations.HandCard}
            headerText={translate('workspace.common.expensifyCard')}
            route={route}
            guidesCallTaskID={CONST.GUIDES_CALL_TASK_IDS.WORKSPACE_EXPENSIFY_CARD}
            shouldShowOfflineIndicatorInWideScreen
        >
            <View style={[styles.mt3, shouldUseNarrowLayout ? styles.workspaceSectionMobile : styles.workspaceSection]}>
                <FeatureList
                    menuItems={expensifyCardFeatures}
                    title={translate('workspace.moreFeatures.expensifyCard.feed.title')}
                    subtitle={translate('workspace.moreFeatures.expensifyCard.feed.subTitle')}
                    ctaText={translate('workspace.moreFeatures.expensifyCard.feed.ctaTitle')}
                    ctaAccessibilityLabel={translate('workspace.moreFeatures.expensifyCard.feed.ctaTitle')}
                    onCtaPress={() => {}}
                    illustrationBackgroundColor={theme.fallbackIconColor}
                    illustration={Illustrations.ExpensifyCardIllustration}
                    illustrationStyle={styles.expensifyCardIllustrationContainer}
                    titleStyles={styles.textHeadlineH1}
                    contentPaddingOnLargeScreens={styles.p5}
                />
            </View>
        </WorkspacePageWithSections>
    );
}

WorkspaceCardPageEmptyState.displayName = 'WorkspaceCardPageEmptyState';

export default WorkspaceCardPageEmptyState;
