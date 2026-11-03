import Text from '@components/Text';

import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

import AuthorizeCardTransactionPreview from '@pages/MultifactorAuthentication/AuthorizeTransactionPage/AuthorizeCardTransactionPreview';

import type {TransactionPendingFraudReview} from '@src/types/onyx';

import React from 'react';
import {View} from 'react-native';

type ReviewTransactionContentProps = {
    transaction: TransactionPendingFraudReview;
};

/** Question and details of the transaction the cardholder is asked to review */
function ReviewTransactionContent({transaction}: ReviewTransactionContentProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    return (
        <View style={styles.mh5}>
            <View style={[styles.gap2, styles.mb6]}>
                <Text style={styles.textHeadlineLineHeightXXL}>{translate('multifactorAuthentication.fraudReview.doYouRecognizeTransaction')}</Text>
                <Text style={styles.textSupporting}>{translate('multifactorAuthentication.fraudReview.weDeclinedSuspiciousTransaction')}</Text>
            </View>
            <View style={styles.mb2}>
                <Text style={styles.textMicroSupporting}>{translate('multifactorAuthentication.reviewTransaction.transactionDetails')}</Text>
            </View>
            <AuthorizeCardTransactionPreview
                transactionID={transaction.transactionID}
                amount={transaction.amount}
                currency={transaction.currency}
                merchant={transaction.merchant}
                created={transaction.created}
                lastFourPAN={transaction.lastFourPAN}
            />
        </View>
    );
}

ReviewTransactionContent.displayName = 'ReviewTransactionContent';

export default ReviewTransactionContent;
