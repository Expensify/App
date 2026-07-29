import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
import Button from '@components/Button';
import FixedFooter from '@components/FixedFooter';
import FullScreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import Text from '@components/Text';

import {useCurrencyListActions} from '@hooks/useCurrencyList';
import useDynamicBackPath from '@hooks/useDynamicBackPath';
import useLocalize from '@hooks/useLocalize';
import useMergeTransactions from '@hooks/useMergeTransactions';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';

import {setMergeTransactionKey} from '@libs/actions/MergeTransaction';
import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import {getMergeableDataAndConflictFields} from '@libs/MergeTransactionUtils';
import createDynamicRoute from '@libs/Navigation/helpers/dynamicRoutesUtils/createDynamicRoute';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {MergeTransactionNavigatorParamList} from '@libs/Navigation/types';
import type {SkeletonSpanReasonAttributes} from '@libs/telemetry/useSkeletonSpan';

import ONYXKEYS from '@src/ONYXKEYS';
import {DYNAMIC_ROUTES} from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type {Transaction} from '@src/types/onyx';
import type {Receipt} from '@src/types/onyx/Transaction';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';

import React from 'react';
import {View} from 'react-native';

import TransactionMergeReceipts from './TransactionMergeReceipts';

type DynamicReceiptReviewPageProps = PlatformStackScreenProps<MergeTransactionNavigatorParamList, typeof SCREENS.MERGE_TRANSACTION.DYNAMIC_RECEIPT_PAGE>;

function DynamicReceiptReviewPage({route}: DynamicReceiptReviewPageProps) {
    const {translate, localeCompare} = useLocalize();
    const styles = useThemeStyles();
    const {getCurrencyDecimals} = useCurrencyListActions();
    const {transactionID, isOnSearch} = route.params;
    const backPath = useDynamicBackPath(DYNAMIC_ROUTES.MERGE_TRANSACTION_RECEIPT.path);

    const [mergeTransaction, mergeTransactionMetadata] = useOnyx(`${ONYXKEYS.COLLECTION.MERGE_TRANSACTION}${getNonEmptyStringOnyxID(transactionID)}`);
    const {targetTransaction, sourceTransaction, targetTransactionPolicy, sourceTransactionPolicy} = useMergeTransactions({mergeTransaction});

    const transactions = [targetTransaction, sourceTransaction].filter((transaction): transaction is Transaction => !!transaction);

    const handleSelect = (receipt: Receipt | undefined) => {
        setMergeTransactionKey(transactionID, {receipt});
    };

    const handleContinue = () => {
        if (!mergeTransaction?.receipt) {
            return;
        }

        const {conflictFields, mergeableData} = getMergeableDataAndConflictFields(
            targetTransaction,
            sourceTransaction,
            localeCompare,
            getCurrencyDecimals,
            [],
            targetTransactionPolicy,
            sourceTransactionPolicy,
        );
        if (!conflictFields.length) {
            // If there are no conflict fields, we should set mergeable data and navigate to the confirmation page
            setMergeTransactionKey(transactionID, mergeableData);
            Navigation.navigate(createDynamicRoute(DYNAMIC_ROUTES.MERGE_TRANSACTION_CONFIRMATION.getRoute(transactionID, isOnSearch), backPath));
            return;
        }
        Navigation.navigate(createDynamicRoute(DYNAMIC_ROUTES.MERGE_TRANSACTION_DETAILS.getRoute(transactionID, isOnSearch), backPath));
    };

    if (isLoadingOnyxValue(mergeTransactionMetadata)) {
        const reasonAttributes: SkeletonSpanReasonAttributes = {
            context: 'TransactionMerge.ReceiptReviewPage',
            isLoadingMergeTransaction: isLoadingOnyxValue(mergeTransactionMetadata),
        };
        return <FullScreenLoadingIndicator reasonAttributes={reasonAttributes} />;
    }

    return (
        <ScreenWrapper
            testID="ReceiptReviewPage"
            shouldEnableMaxHeight
            includeSafeAreaPaddingBottom
        >
            <FullPageNotFoundView shouldShow={!mergeTransaction}>
                <HeaderWithBackButton
                    title={translate('transactionMerge.receiptPage.header')}
                    onBackButtonPress={() => {
                        Navigation.goBack();
                    }}
                />
                <ScrollView style={[styles.pv3, styles.ph5]}>
                    <View style={[styles.mb5]}>
                        <Text>{translate('transactionMerge.receiptPage.pageTitle')}</Text>
                    </View>
                    <TransactionMergeReceipts
                        transactions={transactions}
                        selectedReceiptID={mergeTransaction?.receipt?.receiptID}
                        onSelect={handleSelect}
                    />
                </ScrollView>
                <FixedFooter>
                    <Button
                        success
                        large
                        text={translate('common.continue')}
                        onPress={handleContinue}
                        style={styles.mt5}
                        isDisabled={!mergeTransaction?.receipt}
                    />
                </FixedFooter>
            </FullPageNotFoundView>
        </ScreenWrapper>
    );
}

export default DynamicReceiptReviewPage;
