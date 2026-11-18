import RenderHTML from '@components/RenderHTML';
import WiseQuotePaymentSummary from '@components/WisePaymentSummary/components/WiseQuotePaymentSummary';

import {useCurrencyListActions} from '@hooks/useCurrencyList';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';

import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';

import ONYXKEYS from '@src/ONYXKEYS';

import React from 'react';
import {View} from 'react-native';

import type {ModalProps} from './ModalContext';

import ConfirmModalWrapper from './ConfirmModalWrapper';
import {ModalActions} from './ModalContext';

type WiseQuoteConfirmModalWrapperProps = ModalProps & {
    reportID: string | undefined;

    /** True when the admin chose to pay only the expenses that are not on hold */
    isPayingUnheldOnly: boolean;

    onConfirm: (wiseQuoteID: string) => void;
};

/** Pay stays disabled until the quote is on screen, since Wise requires the admin to see it before paying */
function WiseQuoteConfirmModalWrapper({closeModal, resolveModal, reportID, isPayingUnheldOnly, onConfirm}: WiseQuoteConfirmModalWrapperProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const {convertToDisplayString} = useCurrencyListActions();
    const [wiseQuote] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${getNonEmptyStringOnyxID(reportID)}`, {selector: (report) => report?.wiseQuote});
    const wiseQuoteID = wiseQuote?.wiseQuoteID;
    const confirmText = wiseQuote ? translate('iou.settlePayment', convertToDisplayString(wiseQuote.debitedAmount, wiseQuote.currency)) : translate('iou.pay');

    return (
        <ConfirmModalWrapper
            closeModal={(payload) => {
                closeModal(payload);
                if (payload?.action === ModalActions.CONFIRM && wiseQuoteID) {
                    onConfirm(wiseQuoteID);
                }
            }}
            resolveModal={resolveModal}
            title={translate('iou.wisePaymentSummary.confirmPayment')}
            prompt={
                <View>
                    <WiseQuotePaymentSummary
                        reportID={reportID}
                        isPayingUnheldOnly={isPayingUnheldOnly}
                    />
                    <View style={styles.mt5}>
                        <RenderHTML html={translate('iou.wisePaymentSummary.paymentDisclosure', {buttonText: translate('iou.pay')})} />
                    </View>
                </View>
            }
            confirmText={confirmText}
            cancelText={translate('common.cancel')}
            isConfirmDisabled={!wiseQuoteID}
            shouldDisableConfirmButtonWhenOffline
            shouldHandleNavigationBack
        />
    );
}

export default WiseQuoteConfirmModalWrapper;
export type {WiseQuoteConfirmModalWrapperProps};
