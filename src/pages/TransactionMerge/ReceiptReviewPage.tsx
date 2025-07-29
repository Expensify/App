import React from 'react';
import {View} from 'react-native';
import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
import Button from '@components/Button';
import FixedFooter from '@components/FixedFooter';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import {setMergeTransactionKey} from '@libs/actions/MergeTransaction';
import {getSourceTransaction} from '@libs/MergeTransactionUtils';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {MergeTransactionNavigatorParamList} from '@libs/Navigation/types';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type {Transaction} from '@src/types/onyx';
import type {Receipt} from '@src/types/onyx/Transaction';
import TransactionMergeReceipts from './TransactionMergeReceipts';

type ReceiptReviewProps = PlatformStackScreenProps<MergeTransactionNavigatorParamList, typeof SCREENS.MERGE_TRANSACTION.RECEIPT_PAGE>;

function ReceiptReview({route}: ReceiptReviewProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const {transactionID, backTo} = route.params;

    const [mergeTransaction] = useOnyx(`${ONYXKEYS.COLLECTION.MERGE_TRANSACTION}${transactionID}`, {canBeMissing: false});
    const [targetTransaction] = useOnyx(`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`, {canBeMissing: false});

    const sourceTransaction = getSourceTransaction(mergeTransaction);

    // Build receipts array from the two transactions
    const transactions = [targetTransaction, sourceTransaction].filter((transaction): transaction is Transaction => !!transaction);

    // Handle radio button toggle (select receipt)
    const handleSelect = (receipt: Receipt | undefined) => {
        setMergeTransactionKey(transactionID, {receipt});
    };

    // Continue button handler
    const handleContinue = () => {
        if (!mergeTransaction?.receipt) {
            return;
        }

        Navigation.navigate(ROUTES.MERGE_TRANSACTION_DETAILS_PAGE.getRoute(transactionID, Navigation.getActiveRoute()));
    };

    return (
        <ScreenWrapper
            testID={ReceiptReview.displayName}
            shouldEnableMaxHeight
            includeSafeAreaPaddingBottom
        >
            <FullPageNotFoundView shouldShow={!mergeTransaction}>
                <HeaderWithBackButton
                    title={translate('transactionMerge.receiptPage.header')}
                    onBackButtonPress={() => {
                        if (backTo) {
                            Navigation.goBack(backTo);
                            return;
                        }
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

ReceiptReview.displayName = 'ReceiptReview';

export default ReceiptReview;
