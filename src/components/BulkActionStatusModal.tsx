import useBottomSafeSafeAreaPaddingStyle from '@hooks/useBottomSafeSafeAreaPaddingStyle';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useOpenConciergeAnywhere from '@hooks/useOpenConciergeAnywhere';
import usePreviousDefined from '@hooks/usePreviousDefined';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';

import Navigation from '@libs/Navigation/Navigation';
import {buildSearchQueryJSON, buildSearchQueryString} from '@libs/SearchQueryUtils';

import {sendBulkActionSummaryFromConcierge} from '@userActions/BulkAction';
import {close} from '@userActions/Modal';

import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {BulkActionType} from '@src/types/onyx/BulkAction';

import React from 'react';
import {View} from 'react-native';

import ActivityIndicator from './ActivityIndicator';
import Button from './Button';
import Modal from './Modal';
import Text from './Text';

const RUNNING_TITLES = {
    [CONST.SEARCH.BULK_ACTION_TYPES.APPROVE]: 'bulkAction.approvingTitle',
    [CONST.SEARCH.BULK_ACTION_TYPES.SUBMIT]: 'bulkAction.submittingTitle',
    [CONST.SEARCH.BULK_ACTION_TYPES.PAY]: 'bulkAction.payingTitle',
    [CONST.SEARCH.BULK_ACTION_TYPES.HOLD]: 'bulkAction.holdingTitle',
    [CONST.SEARCH.BULK_ACTION_TYPES.UNHOLD]: 'bulkAction.unholdingTitle',
    [CONST.SEARCH.BULK_ACTION_TYPES.REJECT]: 'bulkAction.rejectingTitle',
    [CONST.SEARCH.BULK_ACTION_TYPES.DELETE]: 'bulkAction.deletingTitle',
    [CONST.BULK_ACTION.DELETE_EXPENSES]: 'bulkAction.deletingExpensesTitle',
} as const satisfies Record<BulkActionType, TranslationPaths>;

const DONE_TITLES = {
    [CONST.SEARCH.BULK_ACTION_TYPES.APPROVE]: 'bulkAction.approvedTitle',
    [CONST.SEARCH.BULK_ACTION_TYPES.SUBMIT]: 'bulkAction.submittedTitle',
    [CONST.SEARCH.BULK_ACTION_TYPES.PAY]: 'bulkAction.paidTitle',
    [CONST.SEARCH.BULK_ACTION_TYPES.HOLD]: 'bulkAction.heldTitle',
    [CONST.SEARCH.BULK_ACTION_TYPES.UNHOLD]: 'bulkAction.unheldTitle',
    [CONST.SEARCH.BULK_ACTION_TYPES.REJECT]: 'bulkAction.rejectedTitle',
    [CONST.SEARCH.BULK_ACTION_TYPES.DELETE]: 'bulkAction.deletedTitle',
    [CONST.BULK_ACTION.DELETE_EXPENSES]: 'bulkAction.deletedExpensesTitle',
} as const satisfies Record<BulkActionType, TranslationPaths>;

type BulkActionStatusModalProps = {
    /** The bulk action ID to subscribe to */
    bulkActionID: string;

    isVisible: boolean;

    /** Callback when the modal is closed */
    onClose: () => void;
};

function BulkActionStatusModal({bulkActionID, isVisible, onClose}: BulkActionStatusModalProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    // isSmallScreenWidth is needed here because the modal type depends on actual screen width, not layout mode
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth
    const {isSmallScreenWidth} = useResponsiveLayout();
    const {openConciergeAnywhere} = useOpenConciergeAnywhere();
    const bottomSafeAreaPaddingStyle = useBottomSafeSafeAreaPaddingStyle({addBottomSafeAreaPadding: isSmallScreenWidth, addOfflineIndicatorBottomSafeAreaPadding: false, style: styles.m5});

    const [bulkAction] = useOnyx(`${ONYXKEYS.COLLECTION.BULK_ACTION}${bulkActionID}`);
    const displayedBulkAction = usePreviousDefined(bulkAction);
    if (!bulkAction && !!displayedBulkAction) {
        return null;
    }

    const state = displayedBulkAction?.state;
    const action = displayedBulkAction?.action;
    const shouldSendFromConcierge = !!displayedBulkAction?.shouldSendFromConcierge;
    const total = displayedBulkAction?.total ?? 0;
    const failedReportIDs = displayedBulkAction?.failedReportIDs ?? [];
    const isRunning = state === CONST.BULK_ACTION.STATE.RUNNING && !shouldSendFromConcierge;
    const isConcierge = shouldSendFromConcierge && state !== CONST.BULK_ACTION.STATE.DONE;

    const handleViewFailedReports = () => {
        const queryJSON = buildSearchQueryJSON(`type:${CONST.SEARCH.DATA_TYPES.EXPENSE_REPORT} ${CONST.SEARCH.SYNTAX_FILTER_KEYS.REPORT_ID}:${failedReportIDs.join(',')}`);
        onClose();
        if (!queryJSON) {
            return;
        }
        close(() => Navigation.navigate(ROUTES.SEARCH_ROOT.getRoute({query: buildSearchQueryString(queryJSON)})));
    };

    const renderContent = () => {
        if (isRunning) {
            return (
                <>
                    <View style={[styles.flexRow, styles.justifyContentBetween, styles.alignItemsCenter, styles.mb2]}>
                        <Text style={[styles.exportDownloadTitle, styles.flexShrink1]}>{translate(RUNNING_TITLES[action ?? CONST.SEARCH.BULK_ACTION_TYPES.PAY])}</Text>
                        <ActivityIndicator size="small" />
                    </View>
                    <Text style={styles.mb5}>{translate('bulkAction.runningBody')}</Text>
                    <Button
                        onPress={() => sendBulkActionSummaryFromConcierge(bulkActionID, displayedBulkAction ?? undefined)}
                        style={styles.w100}
                    >
                        <Button.Text>{translate('bulkAction.sendFromConcierge')}</Button.Text>
                    </Button>
                </>
            );
        }

        if (isConcierge) {
            return (
                <>
                    <Text style={[styles.exportDownloadTitle, styles.mb2]}>{translate('bulkAction.conciergeTitle')}</Text>
                    <Text style={styles.mb5}>{translate('bulkAction.conciergeBody')}</Text>
                    <Button
                        variant={CONST.BUTTON_VARIANT.SUCCESS}
                        onPress={() => close(() => openConciergeAnywhere({forceConcierge: true}))}
                        style={styles.w100}
                    >
                        <Button.Text>{translate('bulkAction.goToConcierge')}</Button.Text>
                    </Button>
                    <Button
                        onPress={onClose}
                        style={[styles.w100, styles.mt3]}
                    >
                        <Button.Text>{translate('common.dismiss')}</Button.Text>
                    </Button>
                </>
            );
        }

        if (state === CONST.BULK_ACTION.STATE.DONE) {
            const count = total - failedReportIDs.length;
            const doneTitle = total === 0 ? translate('bulkAction.noReportsTitle') : translate(DONE_TITLES[action ?? CONST.SEARCH.BULK_ACTION_TYPES.PAY], {count, total});
            return (
                <>
                    <Text style={[styles.exportDownloadTitle, styles.mb2]}>{doneTitle}</Text>
                    {total === 0 && <Text style={styles.mb5}>{translate('bulkAction.noReportsBody')}</Text>}
                    {failedReportIDs.length > 0 && (
                        <>
                            <Text style={styles.mb5}>{translate('bulkAction.failedReportsBody', {count: failedReportIDs.length})}</Text>
                            <Button
                                variant={CONST.BUTTON_VARIANT.SUCCESS}
                                onPress={handleViewFailedReports}
                                style={[styles.w100, styles.mb3]}
                            >
                                <Button.Text>{translate('bulkAction.viewFailedReports')}</Button.Text>
                            </Button>
                        </>
                    )}
                    <Button
                        onPress={onClose}
                        style={styles.w100}
                    >
                        <Button.Text>{translate('common.close')}</Button.Text>
                    </Button>
                </>
            );
        }

        if (state === CONST.BULK_ACTION.STATE.FAILED) {
            return (
                <>
                    <Text style={[styles.exportDownloadTitle, styles.mb2]}>{translate('bulkAction.failedTitle')}</Text>
                    <Text style={styles.mb5}>{translate('bulkAction.failedBody')}</Text>
                    <Button
                        onPress={onClose}
                        style={styles.w100}
                    >
                        <Button.Text>{translate('common.close')}</Button.Text>
                    </Button>
                </>
            );
        }

        return null;
    };

    return (
        <Modal
            isVisible={isVisible}
            onClose={isRunning ? () => {} : onClose}
            onBackdropPress={isRunning ? () => {} : undefined}
            shouldTreatModalAsCovering
            type={isSmallScreenWidth ? CONST.MODAL.MODAL_TYPE.BOTTOM_DOCKED : CONST.MODAL.MODAL_TYPE.CONFIRM}
            innerContainerStyle={styles.pv0}
            enableEdgeToEdgeBottomSafeAreaPadding
        >
            <View style={bottomSafeAreaPaddingStyle}>{renderContent()}</View>
        </Modal>
    );
}

export default BulkActionStatusModal;
