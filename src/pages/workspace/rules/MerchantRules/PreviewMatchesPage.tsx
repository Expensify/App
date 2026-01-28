import type {ListRenderItem} from '@shopify/flash-list';
import {FlashList} from '@shopify/flash-list';
import React, {useCallback, useEffect} from 'react';
import {View} from 'react-native';
import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';
import BlockingView from '@components/BlockingViews/BlockingView';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import DateCell from '@components/SelectionListWithSections/Search/DateCell';
import Text from '@components/Text';
import CategoryCell from '@components/TransactionItemRow/DataCells/CategoryCell';
import MerchantOrDescriptionCell from '@components/TransactionItemRow/DataCells/MerchantCell';
import ReceiptCell from '@components/TransactionItemRow/DataCells/ReceiptCell';
import TagCell from '@components/TransactionItemRow/DataCells/TagCell';
import TotalCell from '@components/TransactionItemRow/DataCells/TotalCell';
import TypeCell from '@components/TransactionItemRow/DataCells/TypeCell';
import {useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import {getTransactionsMatchingCodingRule} from '@libs/actions/Policy/Rules';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import {isOpenExpenseReport} from '@libs/ReportUtils';
import {getCreated, getMerchant} from '@libs/TransactionUtils';
import variables from '@styles/variables';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type {MerchantRuleForm} from '@src/types/form';
import type {Report, Transaction} from '@src/types/onyx';

type PreviewMatchesPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.RULES_MERCHANT_PREVIEW_MATCHES>;

const merchantRuleFormSelector = (form: OnyxEntry<MerchantRuleForm>) => form?.merchantToMatch ?? '';

function PreviewMatchesPage({route}: PreviewMatchesPageProps) {
    const policyID = route.params.policyID;
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const illustrations = useMemoizedLazyIllustrations(['Telescope']);
    const [merchant = ''] = useOnyx(ONYXKEYS.FORMS.MERCHANT_RULE_FORM, {canBeMissing: true, selector: merchantRuleFormSelector});

    const matchingReportIDsSelector = useCallback(
        (reports: OnyxCollection<Report>) => {
            return Object.values(reports ?? {}).reduce((matchingReports, report) => {
                if (!report) {
                    return matchingReports;
                }

                if (isOpenExpenseReport(report) && report?.policyID === policyID) {
                    matchingReports.add(report.reportID);
                }

                return matchingReports;
            }, new Set<string>());
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [policyID, merchant],
    );

    const [matchingReportIDs] = useOnyx(ONYXKEYS.COLLECTION.REPORT, {canBeMissing: true, selector: matchingReportIDsSelector});

    const matchingTransactionsSelector = useCallback(
        (transactions: OnyxCollection<Transaction>) => {
            return Object.values(transactions ?? {}).reduce((matchingTransactions, transaction) => {
                const transactionReportID = transaction?.reportID;

                if (!transactionReportID || !matchingReportIDs?.has(transactionReportID)) {
                    return matchingTransactions;
                }

                // This merchant matching logic should match
                // https://github.com/Expensify/Web-Expensify/blob/fcdbe59e80ecaa4a63f0c4a2779b2aa6c9b1d165/lib/ExpenseRule.php#L54-L59
                const targetMerchant = merchant.replaceAll(/\s+/g, ' ').toLowerCase();
                const transactionMerchant = getMerchant(transaction)?.replaceAll(/\s+/g, ' ').toLowerCase();
                const hasMatchingMerchant = new RegExp(targetMerchant, 'i').test(transactionMerchant);

                if (hasMatchingMerchant) {
                    matchingTransactions.add(transaction);
                }

                return matchingTransactions;
            }, new Set<Transaction>());
        },
        [matchingReportIDs, merchant],
    );

    const [matchingTransactions] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION, {canBeMissing: true, selector: matchingTransactionsSelector});

    useEffect(() => {
        getTransactionsMatchingCodingRule({merchant, policyID});
    }, [merchant, policyID]);

    const onBack = () => {
        Navigation.goBack(ROUTES.RULES_MERCHANT_NEW.getRoute(policyID));
    };

    const matchingTransactionsArray = Array.from(matchingTransactions ?? []);
    const hasMatchingTransactions = !!merchant && !!matchingTransactionsArray.length;

    const renderItem: ListRenderItem<Transaction> = ({item}) => {
        const createdAt = getCreated(item);
        const hasCategoryOrTag = !!item.category || !!item.tag;
        const merchantOrDescription = getMerchant(item) ?? item.comment;

        return (
            <View style={[styles.expenseWidgetRadius, styles.justifyContentEvenly, styles.overflowHidden, styles.activeComponentBG]}>
                <View style={[styles.flexRow]}>
                    <ReceiptCell
                        transactionItem={item}
                        style={styles.mr3}
                        isSelected={false}
                    />
                    <View style={[styles.flex2, styles.flexColumn, styles.justifyContentEvenly]}>
                        <View style={[styles.flexRow, styles.alignItemsCenter, styles.minHeight5, styles.maxHeight5]}>
                            <DateCell
                                showTooltip
                                isLargeScreenWidth={false}
                                date={createdAt}
                            />
                            <Text style={[styles.textMicroSupporting]}> • </Text>
                            <TypeCell
                                shouldShowTooltip
                                shouldUseNarrowLayout
                                transactionItem={item}
                            />
                            {!merchantOrDescription && (
                                <View style={[styles.mlAuto]}>
                                    <TotalCell
                                        shouldShowTooltip
                                        shouldUseNarrowLayout
                                        transactionItem={item}
                                    />
                                </View>
                            )}
                        </View>
                        {!!merchantOrDescription && (
                            <View style={[styles.flexRow, styles.alignItemsCenter, styles.justifyContentBetween, styles.gap2]}>
                                <MerchantOrDescriptionCell
                                    shouldShowTooltip
                                    shouldUseNarrowLayout
                                    merchantOrDescription={merchantOrDescription}
                                    isDescription={!merchant}
                                />
                                <TotalCell
                                    shouldShowTooltip
                                    shouldUseNarrowLayout
                                    transactionItem={item}
                                />
                            </View>
                        )}
                    </View>
                </View>
                <View style={[styles.flexRow, styles.justifyContentBetween, styles.alignItemsStart]}>
                    <View style={[styles.flexColumn, styles.flex1]}>
                        {hasCategoryOrTag && (
                            <View style={[styles.flexRow, styles.alignItemsCenter, styles.gap2, styles.mt2, styles.minHeight4]}>
                                <CategoryCell
                                    shouldShowTooltip
                                    shouldUseNarrowLayout
                                    transactionItem={item}
                                />
                                <TagCell
                                    shouldShowTooltip
                                    shouldUseNarrowLayout
                                    transactionItem={item}
                                />
                            </View>
                        )}
                    </View>
                </View>
            </View>
        );
    };

    const keyExtractor = (item: Transaction) => item.transactionID;

    return (
        <ScreenWrapper
            testID="PreviewMatchesPage"
            shouldShowOfflineIndicatorInWideScreen
            includeSafeAreaPaddingBottom
            shouldEnableMaxHeight
        >
            <HeaderWithBackButton
                title={translate('workspace.rules.merchantRules.previewMatches')}
                onBackButtonPress={onBack}
            />
            <View style={[styles.flex1]}>
                {!hasMatchingTransactions && (
                    <BlockingView
                        icon={illustrations.Telescope}
                        iconWidth={variables.emptyListIconWidth}
                        iconHeight={variables.emptyListIconHeight}
                        title={translate('workspace.rules.merchantRules.previewMatchesEmptyStateTitle')}
                        subtitle={translate('workspace.rules.merchantRules.previewMatchesEmptyStateSubtitle')}
                        containerStyle={styles.pb10}
                    />
                )}

                {hasMatchingTransactions && (
                    <FlashList
                        data={matchingTransactionsArray}
                        renderItem={renderItem}
                        keyExtractor={keyExtractor}
                        contentContainerStyle={[styles.mhn5]}
                        estimatedItemSize={64}
                    />
                )}
            </View>
        </ScreenWrapper>
    );
}

PreviewMatchesPage.displayName = 'PreviewMatchesPage';

export default PreviewMatchesPage;
