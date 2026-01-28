import type {ListRenderItem} from '@shopify/flash-list';
import {FlashList} from '@shopify/flash-list';
import React, {useEffect} from 'react';
import {View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import ActivityIndicator from '@components/ActivityIndicator';
import BlockingView from '@components/BlockingViews/BlockingView';
import FullPageOfflineBlockingView from '@components/BlockingViews/FullPageOfflineBlockingView';
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
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import {getTransactionsMatchingCodingRule} from '@libs/actions/Policy/Rules';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import {getCreated, getDescription, getMerchant} from '@libs/TransactionUtils';
import variables from '@styles/variables';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type {MerchantRuleForm} from '@src/types/form';
import type {Transaction} from '@src/types/onyx';

type PreviewMatchesPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.RULES_MERCHANT_PREVIEW_MATCHES>;

const merchantRuleFormSelector = (form: OnyxEntry<MerchantRuleForm>) => form?.merchantToMatch ?? '';

function PreviewMatchesPage({route}: PreviewMatchesPageProps) {
    const policyID = route.params.policyID;

    const theme = useTheme();
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {isOffline} = useNetwork();
    const illustrations = useMemoizedLazyIllustrations(['Telescope']);

    const [isLoading] = useOnyx(ONYXKEYS.IS_LOADING_POLICY_CODING_RULES_PREVIEW, {canBeMissing: true});
    const [matchingTransactions] = useOnyx(ONYXKEYS.COLLECTION.CODING_RULE_MATCHING_TRANSACTION, {canBeMissing: true});
    const [merchant = ''] = useOnyx(ONYXKEYS.FORMS.MERCHANT_RULE_FORM, {canBeMissing: true, selector: merchantRuleFormSelector});

    useEffect(() => {
        if (isOffline) {
            return;
        }

        getTransactionsMatchingCodingRule(policyID, merchant);
    }, [merchant, policyID, isOffline]);

    const matchingTransactionsArray = Object.values(matchingTransactions ?? {}).filter((transaction): transaction is Transaction => !!transaction);
    const hasMatchingTransactions = !!(merchant && matchingTransactionsArray.length);

    const isLoadedAndEmpty = !isLoading && !hasMatchingTransactions;
    const isLoadedWithTransactions = !isLoading && hasMatchingTransactions;

    const renderItem: ListRenderItem<Transaction> = ({item}) => {
        const createdAt = getCreated(item);
        const hasCategoryOrTag = !!item.category || !!item.tag;
        const merchantOrDescription = getMerchant(item) ?? getDescription(item);

        return (
            <View style={[styles.expenseWidgetRadius, styles.justifyContentEvenly, styles.overflowHidden, styles.highlightBG, styles.p3, styles.mb2]}>
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

    const goBack = () => {
        Navigation.goBack(ROUTES.RULES_MERCHANT_NEW.getRoute(policyID));
    };

    return (
        <ScreenWrapper
            testID="PreviewMatchesPage"
            includeSafeAreaPaddingBottom
            shouldEnableMaxHeight
        >
            <HeaderWithBackButton
                title={translate('workspace.rules.merchantRules.previewMatches')}
                onBackButtonPress={goBack}
            />

            <FullPageOfflineBlockingView>
                <View style={[styles.flex1]}>
                    {!!isLoading && (
                        <View style={[styles.flex1, styles.flexColumn, styles.justifyContentCenter, styles.alignItemsCenter]}>
                            <ActivityIndicator
                                color={theme.spinner}
                                size={25}
                                style={[styles.pl3]}
                            />
                        </View>
                    )}

                    {isLoadedAndEmpty && (
                        <BlockingView
                            icon={illustrations.Telescope}
                            iconWidth={variables.emptyListIconWidth}
                            iconHeight={variables.emptyListIconHeight}
                            title={translate('workspace.rules.merchantRules.previewMatchesEmptyStateTitle')}
                            subtitle={translate('workspace.rules.merchantRules.previewMatchesEmptyStateSubtitle')}
                            containerStyle={styles.pb10}
                        />
                    )}

                    {isLoadedWithTransactions && (
                        <FlashList
                            data={matchingTransactionsArray}
                            renderItem={renderItem}
                            keyExtractor={keyExtractor}
                            contentContainerStyle={[styles.mh5]}
                        />
                    )}
                </View>
            </FullPageOfflineBlockingView>
        </ScreenWrapper>
    );
}

export default PreviewMatchesPage;
