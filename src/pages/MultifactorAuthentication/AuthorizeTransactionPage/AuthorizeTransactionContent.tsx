import Text from '@components/Text';

import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

import type {TransactionPending3DSReview} from '@src/types/onyx';

import React from 'react';
import {View} from 'react-native';

import AuthorizeCardTransactionPreview from './AuthorizeCardTransactionPreview';

type MultifactorAuthenticationAuthorizeTransactionContentProps = {
    transaction: Pick<TransactionPending3DSReview, 'transactionID' | 'amount' | 'currency' | 'merchant' | 'created' | 'lastFourPAN'>;

    /** Question shown above the transaction, falls back to the 3DS wording */
    title?: string;

    /** Explanation under the question, falls back to the 3DS wording */
    description?: string;
};

function MultifactorAuthenticationAuthorizeTransactionContent({transaction, title, description}: MultifactorAuthenticationAuthorizeTransactionContentProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    return (
        <View style={styles.mh5}>
            <View style={[styles.gap2, styles.mb6]}>
                <Text style={styles.textHeadlineLineHeightXXL}>{title ?? translate('multifactorAuthentication.reviewTransaction.pleaseReview')}</Text>
                <Text style={styles.textSupporting}>{description ?? translate('multifactorAuthentication.reviewTransaction.requiresYourReview')}</Text>
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

MultifactorAuthenticationAuthorizeTransactionContent.displayName = 'MultifactorAuthenticationAuthorizeTransactionContent';

export default MultifactorAuthenticationAuthorizeTransactionContent;
