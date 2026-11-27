import Text from '@components/Text';
import WisePaymentPrompt from '@components/WisePaymentSummary/components/WisePaymentPrompt';
import WiseQuoteCarousel from '@components/WisePaymentSummary/components/WiseQuoteCarousel';
import WiseQuoteCarouselArrows from '@components/WisePaymentSummary/components/WiseQuoteCarouselArrows';
import useWiseQuoteCarousel from '@components/WisePaymentSummary/hooks/useWiseQuoteCarousel';

import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';

import {isWiseQuoteExpired} from '@libs/WiseQuoteUtils';

import ONYXKEYS from '@src/ONYXKEYS';
import type {Report} from '@src/types/onyx';
import {getEmptyObject} from '@src/types/utils/EmptyObject';

import type {OnyxCollection} from 'react-native-onyx';

import React from 'react';
import {View} from 'react-native';

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

    /** Runs instead of onConfirm when the admin pays with any quote Wise would reject as expired */
    onQuoteExpired: () => void;
};

type QuoteState = {
    wiseQuoteID?: string;
    expiresAt?: string;
    hasError: boolean;
};

/** Pay all stays disabled until every quoted report's quote is loaded, since Wise requires the admin to be able to see each one */
function WiseQuoteCarouselModalWrapper({closeModal, resolveModal, reports, quotedReportIDs, onConfirm, onQuoteExpired}: WiseQuoteCarouselModalWrapperProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const selectQuoteStates = (onyxReports: OnyxCollection<Report>) =>
        Object.fromEntries(
            quotedReportIDs.map((reportID) => {
                const report = onyxReports?.[`${ONYXKEYS.COLLECTION.REPORT}${reportID}`];
                return [reportID, {wiseQuoteID: report?.wiseQuote?.wiseQuoteID, expiresAt: report?.wiseQuote?.expiresAt, hasError: !!report?.errorFields?.wiseQuote}];
            }),
        );
    const [quoteStatesByReportID = getEmptyObject<Record<string, QuoteState>>()] = useOnyx(ONYXKEYS.COLLECTION.REPORT, {
        selector: selectQuoteStates,
    });
    const quoteStates = Object.entries(quoteStatesByReportID);
    const confirmedQuoteIDs = quoteStates.flatMap(([reportID, {wiseQuoteID}]) => (wiseQuoteID ? [[reportID, wiseQuoteID] as const] : []));
    const hasEveryQuote = confirmedQuoteIDs.length === quotedReportIDs.length;
    const isLoading = quoteStates.length < quotedReportIDs.length || quoteStates.some(([, {wiseQuoteID, hasError}]) => !wiseQuoteID && !hasError);

    const confirmText = translate('iou.wisePaymentSummary.payAll');
    const carousel = useWiseQuoteCarousel(reports.length);

    return (
        <ConfirmModalWrapper
            closeModal={(payload) => {
                closeModal(payload);
                if (payload?.action !== ModalActions.CONFIRM || !hasEveryQuote) {
                    return;
                }
                if (quoteStates.some(([, {expiresAt}]) => isWiseQuoteExpired(expiresAt))) {
                    onQuoteExpired();
                    return;
                }
                onConfirm(Object.fromEntries(confirmedQuoteIDs));
            }}
            resolveModal={resolveModal}
            title={translate('iou.wisePaymentSummary.confirmPayment')}
            titleContainerStyles={styles.mb0}
            subtitle={<Text style={styles.textLabelSupporting}>{translate('iou.wisePaymentSummary.reportCount', {count: reports.length})}</Text>}
            titleRightElement={carousel.hasMultipleReports ? <WiseQuoteCarouselArrows carousel={carousel} /> : undefined}
            prompt={
                <WisePaymentPrompt buttonText={confirmText}>
                    <View style={styles.mt5}>
                        <WiseQuoteCarousel
                            reports={reports}
                            quotedReportIDs={quotedReportIDs}
                            isLoading={isLoading}
                            carousel={carousel}
                        />
                    </View>
                </WisePaymentPrompt>
            }
            confirmText={confirmText}
            cancelText={translate('common.cancel')}
            isConfirmDisabled={!hasEveryQuote}
            shouldDisableConfirmButtonWhenOffline
            shouldHandleNavigationBack
        />
    );
}

export default WiseQuoteCarouselModalWrapper;
export type {WiseQuoteCarouselModalWrapperProps};
