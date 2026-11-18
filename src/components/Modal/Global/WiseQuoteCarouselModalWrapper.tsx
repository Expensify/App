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
    /** The reports being paid, as bulk pay read them, which can be from Search results only */
    reports: Report[];

    /** The reports Wise pays through a global provider, each waiting for its quote */
    quotedReportIDs: string[];

    /** Receives the confirmed quote of every quoted report, keyed by reportID */
    onConfirm: (wiseQuoteIDsByReportID: Record<string, string>) => void;
};

/** Pay all stays disabled until every quoted report's quote is loaded, since Wise requires the admin to be able to see each one */
function WiseQuoteCarouselModalWrapper({closeModal, resolveModal, reports, quotedReportIDs, onConfirm}: WiseQuoteCarouselModalWrapperProps) {
    const {translate} = useLocalize();
    const selectQuoteStates = (onyxReports: OnyxCollection<Report>) =>
        Object.fromEntries(
            quotedReportIDs.map((reportID) => {
                const report = onyxReports?.[`${ONYXKEYS.COLLECTION.REPORT}${reportID}`];
                return [reportID, {wiseQuoteID: report?.wiseQuote?.wiseQuoteID, hasError: !!report?.errorFields?.wiseQuote}];
            }),
        );
    const [quoteStatesByReportID = getEmptyObject<Record<string, {wiseQuoteID?: string; hasError: boolean}>>()] = useOnyx(ONYXKEYS.COLLECTION.REPORT, {
        selector: selectQuoteStates,
    });
    const quoteStates = Object.entries(quoteStatesByReportID);
    const confirmedQuoteIDs = quoteStates.flatMap(([reportID, {wiseQuoteID}]) => (wiseQuoteID ? [[reportID, wiseQuoteID] as const] : []));
    const hasEveryQuote = confirmedQuoteIDs.length === quotedReportIDs.length;
    const isLoading = quoteStates.length < quotedReportIDs.length || quoteStates.some(([, {wiseQuoteID, hasError}]) => !wiseQuoteID && !hasError);

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
                    reports={reports}
                    quotedReportIDs={quotedReportIDs}
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
