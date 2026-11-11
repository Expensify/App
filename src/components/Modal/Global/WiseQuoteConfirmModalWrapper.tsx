import WiseQuotePaymentSummary from '@components/WisePaymentSummary/components/WiseQuotePaymentSummary';

import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';

import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';

import ONYXKEYS from '@src/ONYXKEYS';

import React from 'react';

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
    const [wiseQuoteID] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${getNonEmptyStringOnyxID(reportID)}`, {selector: (report) => report?.wiseQuote?.wiseQuoteID});

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
                <WiseQuotePaymentSummary
                    reportID={reportID}
                    isPayingUnheldOnly={isPayingUnheldOnly}
                />
            }
            confirmText={translate('iou.pay')}
            cancelText={translate('common.cancel')}
            isConfirmDisabled={!wiseQuoteID}
            shouldDisableConfirmButtonWhenOffline
            shouldHandleNavigationBack
        />
    );
}

export default WiseQuoteConfirmModalWrapper;
export type {WiseQuoteConfirmModalWrapperProps};
