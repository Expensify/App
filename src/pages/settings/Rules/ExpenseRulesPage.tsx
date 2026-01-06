import React from 'react';
import {View} from 'react-native';
import ActivityIndicator from '@components/ActivityIndicator';
import EmptyStateComponent from '@components/EmptyStateComponent';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import LottieAnimations from '@components/LottieAnimations';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import SelectionListWithModal from '@components/SelectionListWithModal';
import CustomListHeader from '@components/SelectionListWithModal/CustomListHeader';
import TableListItem from '@components/SelectionListWithSections/TableListItem';
import TableListItemSkeleton from '@components/Skeletons/TableRowSkeleton';
import Text from '@components/Text';
import {useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import {canUseTouchScreen} from '@libs/DeviceCapabilities';
import {formatExpenseRuleChanges} from '@libs/ExpenseRuleUtils';
import Navigation from '@libs/Navigation/Navigation';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';

function ExpenseRulesPage() {
    const {translate} = useLocalize();
    const illustrations = useMemoizedLazyIllustrations(['Flash']);
    const [expenseRules, expenseRulesResult] = useOnyx(ONYXKEYS.NVP_EXPENSE_RULES, {canBeMissing: true});
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const styles = useThemeStyles();

    const hasRules = expenseRules ? expenseRules.length > 0 : false;
    const isLoading = !hasRules && isLoadingOnyxValue(expenseRulesResult);

    const rulesList = (expenseRules ?? []).map((rule, index) => ({
        text: rule.merchantToMatch,
        keyForList: `${rule.merchantToMatch}${index}`,
        isDisabledCheckbox: true,
        isDisabled: true,
        rightElement: (
            <View style={[styles.flex1]}>
                <Text
                    numberOfLines={1}
                    style={[styles.alignSelfStart]}
                >
                    {formatExpenseRuleChanges(rule, translate)}
                </Text>
            </View>
        ),
    }));

    const headerContent = (
        <View style={[styles.ph5, styles.pb5, styles.pt3, shouldUseNarrowLayout && styles.workspaceSectionMobile]}>
            <Text style={[styles.textNormal, styles.colorMuted]}>{translate('expenseRulesPage.subtitle')}</Text>
        </View>
    );

    const getCustomListHeader = () => (
        <CustomListHeader
            canSelectMultiple={false}
            leftHeaderText={translate('common.merchant')}
            rightHeaderText={translate('common.change')}
            shouldDivideEqualWidth
            shouldShowRightCaret={false}
        />
    );

    return (
        <ScreenWrapper
            enableEdgeToEdgeBottomSafeAreaPadding
            style={[styles.defaultModalContainer]}
            testID={ExpenseRulesPage.displayName}
            shouldShowOfflineIndicatorInWideScreen
            offlineIndicatorStyle={styles.mtAuto}
        >
            <HeaderWithBackButton
                icon={illustrations.Flash}
                shouldUseHeadlineHeader
                title={translate('expenseRulesPage.title')}
                shouldShowBackButton={shouldUseNarrowLayout}
                onBackButtonPress={() => {
                    Navigation.popToSidebar();
                }}
            />
            {!hasRules && !isLoading && headerContent}
            {!hasRules && !isLoading && (
                <ScrollView contentContainerStyle={[styles.flexGrow1, styles.flexShrink0]}>
                    <EmptyStateComponent
                        SkeletonComponent={TableListItemSkeleton}
                        headerMediaType={CONST.EMPTY_STATE_MEDIA.ANIMATION}
                        headerMedia={LottieAnimations.GenericEmptyState}
                        title={translate('expenseRulesPage.emptyRules.title')}
                        subtitle={translate('expenseRulesPage.emptyRules.subtitle')}
                        headerStyles={[styles.emptyStateCardIllustrationContainer, styles.emptyFolderBG]}
                        lottieWebViewStyles={styles.emptyStateFolderWebStyles}
                        headerContentStyles={styles.emptyStateFolderWebStyles}
                    />
                </ScrollView>
            )}
            {!hasRules && isLoading && (
                <ActivityIndicator
                    size={CONST.ACTIVITY_INDICATOR_SIZE.LARGE}
                    style={[styles.flex1]}
                />
            )}
            {hasRules && (
                <SelectionListWithModal
                    addBottomSafeAreaPadding
                    canSelectMultiple={false}
                    customListHeader={getCustomListHeader()}
                    listHeaderContent={headerContent}
                    listHeaderWrapperStyle={[styles.ph9, styles.pv3, styles.pb5]}
                    ListItem={TableListItem}
                    onSelectRow={() => {}}
                    sections={[{data: rulesList, isDisabled: true}]}
                    shouldPreventDefaultFocusOnSelectRow={!canUseTouchScreen()}
                    shouldShowListEmptyContent={false}
                    shouldShowRightCaret={false}
                    shouldUseDefaultRightHandSideCheckmark={false}
                    showScrollIndicator={false}
                    turnOnSelectionModeOnLongPress={false}
                />
            )}
        </ScreenWrapper>
    );
}

ExpenseRulesPage.displayName = 'ExpenseRulesPage';

export default ExpenseRulesPage;
