import type {StackScreenProps} from '@react-navigation/stack';
import React from 'react';
import {View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import FeatureList from '@components/FeatureList';
import type {FeatureListItem} from '@components/FeatureList';
import * as Illustrations from '@components/Icon/Illustrations';
import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import type {FullScreenNavigatorParamList} from '@libs/Navigation/types';
import Navigation from '@navigation/Navigation';
import type {WithPolicyAndFullscreenLoadingProps} from '@pages/workspace/withPolicyAndFullscreenLoading';
import withPolicyAndFullscreenLoading from '@pages/workspace/withPolicyAndFullscreenLoading';
import WorkspacePageWithSections from '@pages/workspace/WorkspacePageWithSections';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

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
type WorkspaceExpensifyCardPageEmptyStateProps = {
    route: StackScreenProps<FullScreenNavigatorParamList, typeof SCREENS.WORKSPACE.EXPENSIFY_CARD>['route'];
} & WithPolicyAndFullscreenLoadingProps;

function WorkspaceExpensifyCardPageEmptyState({route, policy}: WorkspaceExpensifyCardPageEmptyStateProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const theme = useTheme();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const [bankAccountList] = useOnyx(ONYXKEYS.BANK_ACCOUNT_LIST);

    const startFlow = () => {
        if (isEmptyObject(bankAccountList)) {
            Navigation.navigate(ROUTES.BANK_ACCOUNT_WITH_STEP_TO_OPEN.getRoute('new', policy?.id, ROUTES.WORKSPACE_EXPENSIFY_CARD.getRoute(policy?.id ?? '-1')));
        } else {
            Navigation.navigate(ROUTES.WORKSPACE_EXPENSIFY_CARD_BANK_ACCOUNT.getRoute(policy?.id ?? '-1'));
        }
    };

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
                    onCtaPress={startFlow}
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

WorkspaceExpensifyCardPageEmptyState.displayName = 'WorkspaceExpensifyCardPageEmptyState';

export default withPolicyAndFullscreenLoading(WorkspaceExpensifyCardPageEmptyState);
