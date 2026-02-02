import type {ListRenderItem} from '@shopify/flash-list';
import {FlashList} from '@shopify/flash-list';
import React, {useEffect} from 'react';
import {View} from 'react-native';
import ActivityIndicator from '@components/ActivityIndicator';
import BlockingView from '@components/BlockingViews/BlockingView';
import FullPageOfflineBlockingView from '@components/BlockingViews/FullPageOfflineBlockingView';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
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
import UnreportedExpenseListItem from '@pages/UnreportedExpenseListItem';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type {Transaction} from '@src/types/onyx';
import type {CodingRuleFilter} from '@src/types/onyx/Policy';

type PreviewMatchesPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.RULES_MERCHANT_PREVIEW_MATCHES>;

function PreviewMatchesPage({route}: PreviewMatchesPageProps) {
    const ruleID = route.params.ruleID;
    const policyID = route.params.policyID;
    const isEditing = ruleID !== ROUTES.NEW;

    const theme = useTheme();
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {isOffline} = useNetwork();
    const illustrations = useMemoizedLazyIllustrations(['Telescope']);

    const [form] = useOnyx(ONYXKEYS.FORMS.MERCHANT_RULE_FORM, {canBeMissing: true});
    const [isLoading] = useOnyx(ONYXKEYS.IS_LOADING_POLICY_CODING_RULES_PREVIEW, {canBeMissing: true});
    const [matchingTransactions] = useOnyx(ONYXKEYS.COLLECTION.CODING_RULE_MATCHING_TRANSACTION, {canBeMissing: true});

    const merchant = form?.merchantToMatch ?? '';
    const operator = form?.matchType ?? CONST.SEARCH.SYNTAX_OPERATORS.CONTAINS;

    useEffect(() => {
        if (isOffline) {
            return;
        }

        const filters: CodingRuleFilter = {
            left: 'merchant',
            operator,
            right: merchant,
        };

        getTransactionsMatchingCodingRule(policyID, filters);
    }, [merchant, operator, policyID, isOffline]);

    const matchingTransactionsArray = Object.values(matchingTransactions ?? {}).filter((transaction): transaction is Transaction => !!transaction);
    const hasMatchingTransactions = !!(merchant && matchingTransactionsArray.length);

    const isLoadedAndEmpty = !isLoading && !hasMatchingTransactions;
    const isLoadedWithTransactions = !isLoading && hasMatchingTransactions;

    const keyExtractor = (item: Transaction) => item.transactionID;
    const renderItem: ListRenderItem<Transaction> = ({item}) => (
        <UnreportedExpenseListItem
            readOnly
            showTooltip
            item={item}
            onSelectRow={() => {}}
        />
    );

    const goBack = () => {
        if (isEditing) {
            Navigation.goBack(ROUTES.RULES_MERCHANT_EDIT.getRoute(policyID, ruleID));
            return;
        }

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
                        />
                    )}
                </View>
            </FullPageOfflineBlockingView>
        </ScreenWrapper>
    );
}

export default PreviewMatchesPage;
