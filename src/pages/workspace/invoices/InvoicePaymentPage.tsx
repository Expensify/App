import React, {useCallback, useMemo, useState} from 'react';
import {View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import {withOnyx} from 'react-native-onyx';
import Button from '@components/Button';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import * as PaymentTracker from '@libs/actions/PaymentTracker';
import * as Policy from '@libs/actions/Policy';
import type {PolicyKey} from '@libs/actions/Policy';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {Invoice, ReimbursementAccount, Session} from '@src/types/onyx';

type InvoicePaymentPageOnyxProps = {
    invoice: OnyxEntry<Invoice>;
    reimbursementAccount: OnyxEntry<ReimbursementAccount>;
    session: OnyxEntry<Session>;
};

type InvoicePaymentPageProps = InvoicePaymentPageOnyxProps & {
    route: {
        params: {
            policyID: string;
            invoiceID: string;
        };
    };
};

function InvoicePaymentPage({invoice, reimbursementAccount, session, route}: InvoicePaymentPageProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const [isProcessingPayment, setIsProcessingPayment] = useState(false);

    const {policyID, invoiceID} = route.params;

    const bankAccountName = useMemo(() => {
        if (!reimbursementAccount?.achData?.bankAccountName) {
            return translate('invoicePaymentPage.defaultBankAccount');
        }
        return reimbursementAccount.achData.bankAccountName;
    }, [reimbursementAccount, translate]);

    const paymentAmount = useMemo(() => {
        if (!invoice?.total) {
            return '0';
        }
        return (invoice.total / 100).toFixed(2);
    }, [invoice?.total]);

    const handlePayInvoice = useCallback(() => {
        if (!invoice || !reimbursementAccount || isProcessingPayment) {
            return;
        }

        setIsProcessingPayment(true);

        const paymentData = {
            invoiceID,
            policyID,
            amount: invoice.total,
            paymentSource: CONST.PAYMENT_METHODS.REIMBURSEMENT_ACCOUNT,
            bankAccountID: reimbursementAccount.bankAccountID,
            timestamp: Date.now(),
            userEmail: session?.email ?? '',
        };

        PaymentTracker.recordPayment(paymentData);

        Policy.payInvoice(
            policyID as PolicyKey,
            invoiceID,
            invoice.total,
            reimbursementAccount.bankAccountID,
            () => {
                setIsProcessingPayment(false);
                Navigation.goBack();
            },
            () => {
                setIsProcessingPayment(false);
            },
        );
    }, [invoice, reimbursementAccount, invoiceID, policyID, isProcessingPayment, session?.email]);

    const canMakePayment = useMemo(() => {
        return (
            !!invoice &&
            !!reimbursementAccount &&
            invoice.status !== CONST.INVOICE_STATUS.PAID &&
            !isProcessingPayment &&
            reimbursementAccount.isEnabled
        );
    }, [invoice, reimbursementAccount, isProcessingPayment]);

    if (!invoice) {
        return (
            <ScreenWrapper testID="InvoicePaymentPage">
                <HeaderWithBackButton title={translate('invoicePaymentPage.title')} />
                <View style={styles.flex1}>
                    <Text>{translate('common.genericErrorMessage')}</Text>
                </View>
            </ScreenWrapper>
        );
    }

    return (
        <ScreenWrapper
            testID="InvoicePaymentPage"
            shouldEnablePickerAvoiding={false}
        >
            <HeaderWithBackButton title={translate('invoicePaymentPage.title')} />
            <ScrollView style={[styles.flex1, styles.pt3]}>
                <View style={[styles.ph5, styles.pb5]}>
                    <MenuItemWithTopDescription
                        description={translate('invoicePaymentPage.invoiceNumber')}
                        title={invoice.invoiceNumber}
                        interactive={false}
                    />

                    <MenuItemWithTopDescription
                        description={translate('invoicePaymentPage.amount')}
                        title={`$${paymentAmount}`}
                        interactive={false}
                        style={styles.mt3}
                    />

                    <MenuItemWithTopDescription
                        description={translate('invoicePaymentPage.paymentSource')}
                        title={bankAccountName}
                        interactive={false}
                        style={styles.mt3}
                    />

                    <MenuItemWithTopDescription
                        description={translate('invoicePaymentPage.invoiceStatus')}
                        title={translate(`invoiceStatus.${invoice.status}`)}
                        interactive={false}
                        style={styles.mt3}
                    />

                    {invoice.status === CONST.INVOICE_STATUS.PAID && (
                        <View style={[styles.mt4, styles.p4, styles.border, styles.borderColorMuted, styles.borderRadius8]}>
                            <Text style={[styles.textLabel, styles.mb2]}>
                                {translate('invoicePaymentPage.paymentTrackingNotice')}
                            </Text>
                            <Text style={styles.textMicroSupporting}>
                                {translate('invoicePaymentPage.paymentTrackingDescription')}
                            </Text>
                        </View>
                    )}
                </View>
            </ScrollView>

            <View style={[styles.ph5, styles.pb5]}>
                <Button
                    success
                    large
                    text={translate('invoicePaymentPage.payInvoice')}
                    onPress={handlePayInvoice}
                    isDisabled={!canMakePayment}
                    isLoading={isProcessingPayment}
                />
            </View>
        </ScreenWrapper>
    );
}

InvoicePaymentPage.displayName = 'InvoicePaymentPage';

export default withOnyx<InvoicePaymentPageProps, InvoicePaymentPageOnyxProps>({
    invoice: {
        key: ({route}) => `${ONYXKEYS.COLLECTION.INVOICE}${route.params.invoiceID}`,
    },
    reimbursementAccount: {
        key: ({route}) => `${ONYXKEYS.COLLECTION.REIMBURSEMENT_ACCOUNT}${route.params.policyID}`,
    },
    session: {
        key: ONYXKEYS.SESSION,
    },
})(InvoicePaymentPage);
