import WiseQuoteCarousel from '@components/WisePaymentSummary/components/WiseQuoteCarousel';

import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';

import ONYXKEYS from '@src/ONYXKEYS';
import type {Report} from '@src/types/onyx';
import {getEmptyObject} from '@src/types/utils/EmptyObject';

import type {OnyxCollection} from 'react-native-onyx';

import React from 'react';

import type {ModalProps} from './ModalContext';

import ConfirmModalWrapper from './ConfirmModalWrapper';
import {ModalActions} from './ModalContext';

type WiseQuoteCarouselModalWrapperProps = ModalProps & {
    reportIDs: string[];

    /** Receives the confirmed quote of every report, keyed by reportID */
    onConfirm: (wiseQuoteIDsByReportID: Record<string, string>) => void;
};

/** Pay all stays disabled until every report's quote is loaded, since Wise requires the admin to be able to see each one */
function WiseQuoteCarouselModalWrapper({closeModal, resolveModal, reportIDs, onConfirm}: WiseQuoteCarouselModalWrapperProps) {
    const {translate} = useLocalize();
    const selectQuoteStates = (reports: OnyxCollection<Report>) =>
        Object.fromEntries(
            reportIDs.map((reportID) => {
                const report = reports?.[`${ONYXKEYS.COLLECTION.REPORT}${reportID}`];
                return [reportID, {wiseQuoteID: report?.wiseQuote?.wiseQuoteID, hasError: !!report?.errorFields?.wiseQuote}];
            }),
        );
    const [quoteStatesByReportID = getEmptyObject<Record<string, {wiseQuoteID?: string; hasError: boolean}>>()] = useOnyx(ONYXKEYS.COLLECTION.REPORT, {
        selector: selectQuoteStates,
    });
    const quoteStates = Object.entries(quoteStatesByReportID);
    const confirmedQuoteIDs = quoteStates.flatMap(([reportID, {wiseQuoteID}]) => (wiseQuoteID ? [[reportID, wiseQuoteID] as const] : []));
    const hasEveryQuote = confirmedQuoteIDs.length === reportIDs.length;
    const isLoading = quoteStates.length < reportIDs.length || quoteStates.some(([, {wiseQuoteID, hasError}]) => !wiseQuoteID && !hasError);

    return (
        <ConfirmModalWrapper
            closeModal={(payload) => {
                closeModal(payload);
                if (payload?.action === ModalActions.CONFIRM && hasEveryQuote) {
                    onConfirm(Object.fromEntries(confirmedQuoteIDs));
                }
            }}
            resolveModal={resolveModal}
            title={translate('iou.wisePaymentSummary.confirmPayment')}
            prompt={
                <WiseQuoteCarousel
                    reportIDs={reportIDs}
                    isLoading={isLoading}
                />
            }
            confirmText={translate('iou.wisePaymentSummary.payAll')}
            cancelText={translate('common.cancel')}
            isConfirmDisabled={!hasEveryQuote}
            shouldDisableConfirmButtonWhenOffline
            shouldHandleNavigationBack
        />
    );
}

export default WiseQuoteCarouselModalWrapper;
export type {WiseQuoteCarouselModalWrapperProps};
