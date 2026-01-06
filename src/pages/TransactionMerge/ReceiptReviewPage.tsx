import React from 'react';
import {View} from 'react-native';
import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
import Button from '@components/Button';
import FixedFooter from '@components/FixedFooter';
import FullScreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useMergeTransactions from '@hooks/useMergeTransactions';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import {setMergeTransactionKey} from '@libs/actions/MergeTransaction';
import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import {getMergeableDataAndConflictFields} from '@libs/MergeTransactionUtils';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {MergeTransactionNavigatorParamList} from '@libs/Navigation/types';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type {Transaction} from '@src/types/onyx';
import type {Receipt} from '@src/types/onyx/Transaction';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';
import TransactionMergeReceipts from './TransactionMergeReceipts';

type ReceiptReviewPageProps = PlatformStackScreenProps<MergeTransactionNavigatorParamList, typeof SCREENS.MERGE_TRANSACTION.RECEIPT_PAGE>;

function ReceiptReviewPage({route}: ReceiptReviewPageProps) {
    const {translate, localeCompare} = useLocalize();
    const styles = useThemeStyles();
    const {transactionID, isOnSearch, backTo} = route.params;

    const [mergeTransaction, mergeTransactionMetadata] = useOnyx(`${ONYXKEYS.COLLECTION.MERGE_TRANSACTION}${getNonEmptyStringOnyxID(transactionID)}`, {canBeMissing: true});
    const {targetTransaction, sourceTransaction} = useMergeTransactions({mergeTransaction});

    const transactions = [targetTransaction, sourceTransaction].filter((transaction): transaction is Transaction => !!transaction);

    const handleSelect = (receipt: Receipt | undefined) => {
        setMergeTransactionKey(transactionID, {receipt});
    };

    const handleContinue = () => {
        if (!mergeTransaction?.receipt) {
            return;
        }

        const {conflictFields, mergeableData} = getMergeableDataAndConflictFields(targetTransaction, sourceTransaction, localeCompare);
        if (!conflictFields.length) {
            // If there are no conflict fields, we should set mergeable data and navigate to the confirmation page
            setMergeTransactionKey(transactionID, mergeableData);
            Navigation.navigate(ROUTES.MERGE_TRANSACTION_CONFIRMATION_PAGE.getRoute(transactionID, Navigation.getActiveRoute(), isOnSearch));
            return;
        }
        Navigation.navigate(ROUTES.MERGE_TRANSACTION_DETAILS_PAGE.getRoute(transactionID, Navigation.getActiveRoute(), isOnSearch));
    };

    if (isLoadingOnyxValue(mergeTransactionMetadata)) {
        return <FullScreenLoadingIndicator />;
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
                        Navigation.goBack(backTo);
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

export default ReceiptReviewPage;
