import {useRef} from 'react';
import {View} from 'react-native';
import type {ValueOf} from 'type-fest';
import type {ButtonWithDropdownMenuRef} from '@components/ButtonWithDropdownMenu/types';
import type {ActionHandledType} from '@components/Modal/Global/HoldMenuModalWrapper';
import {useMoneyReportHeaderModals} from '@components/MoneyReportHeaderModalsContext';
import MoneyReportHeaderPrimaryAction from '@components/MoneyReportHeaderPrimaryAction';
import {useSearchStateContext} from '@components/Search/SearchContext';
import useExportAgainModal from '@hooks/useExportAgainModal';
import useOnyx from '@hooks/useOnyx';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useResponsiveLayoutOnWideRHP from '@hooks/useResponsiveLayoutOnWideRHP';
import useThemeStyles from '@hooks/useThemeStyles';
import useTransactionThreadReport from '@hooks/useTransactionThreadReport';
import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {PaymentMethodType} from '@src/types/onyx/OriginalMessage';
import MoneyReportHeaderSecondaryActions from './MoneyReportHeaderSecondaryActions';
import MoneyReportHeaderSelectionDropdown from './MoneyReportHeaderSelectionDropdown';

type MoneyReportHeaderActionsProps = {
    reportID: string | undefined;
    primaryAction: ValueOf<typeof CONST.REPORT.PRIMARY_ACTIONS> | ValueOf<typeof CONST.REPORT.TRANSACTION_PRIMARY_ACTIONS> | '';
    isPaidAnimationRunning: boolean;
    isApprovedAnimationRunning: boolean;
    isSubmittingAnimationRunning: boolean;
    stopAnimation: () => void;
    startAnimation: () => void;
    startApprovedAnimation: () => void;
    startSubmittingAnimation: () => void;
};

/**
 * Narrow the wide primaryAction union to what report-level secondary actions accept.
 * TRANSACTION_PRIMARY_ACTIONS values (e.g. "keepThisOne") are irrelevant here.
 */
function narrowPrimaryAction(primaryAction: MoneyReportHeaderActionsProps['primaryAction']): ValueOf<typeof CONST.REPORT.PRIMARY_ACTIONS> | '' {
    if ((Object.values(CONST.REPORT.PRIMARY_ACTIONS) as string[]).includes(primaryAction)) {
        return primaryAction as ValueOf<typeof CONST.REPORT.PRIMARY_ACTIONS>;
    }
    return '';
}

function MoneyReportHeaderActions({
    reportID,
    primaryAction,
    isPaidAnimationRunning,
    isApprovedAnimationRunning,
    isSubmittingAnimationRunning,
    stopAnimation,
    startAnimation,
    startApprovedAnimation,
    startSubmittingAnimation,
}: MoneyReportHeaderActionsProps) {
    const styles = useThemeStyles();
    const dropdownMenuRef = useRef<ButtonWithDropdownMenuRef>(null) as React.RefObject<ButtonWithDropdownMenuRef>;

    // ── Layout ──
    // We need isSmallScreenWidth for the hold expense modal layout https://github.com/Expensify/App/pull/47990#issuecomment-2362382026
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth
    const {shouldUseNarrowLayout, isMediumScreenWidth} = useResponsiveLayout();
    const shouldDisplayNarrowVersion = shouldUseNarrowLayout || isMediumScreenWidth;
    const {isWideRHPDisplayedOnWideLayout, isSuperWideRHPDisplayedOnWideLayout} = useResponsiveLayoutOnWideRHP();
    const shouldDisplayNarrowMoreButton = !shouldDisplayNarrowVersion || isWideRHPDisplayedOnWideLayout || isSuperWideRHPDisplayedOnWideLayout;

    // ── Onyx data ──
    const [moneyRequestReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`);
    const [chatReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${getNonEmptyStringOnyxID(moneyRequestReport?.chatReportID)}`);

    // ── Transaction thread ──
    const {transactionThreadReportID} = useTransactionThreadReport(reportID);

    const {openHoldMenu, openPDFDownload, openHoldEducational, openRejectModal} = useMoneyReportHeaderModals();

    const onHoldMenuOpen = (requestType: string, paymentType?: PaymentMethodType, methodID?: number, onConfirm?: (full: boolean) => void) => {
        openHoldMenu({requestType: requestType as ActionHandledType, paymentType, methodID, onConfirm});
    };

    const {triggerExportOrConfirm} = useExportAgainModal(moneyRequestReport?.reportID, moneyRequestReport?.policyID);

    const {selectedTransactionIDs} = useSearchStateContext();
    const shouldShowSelectedTransactionsButton = !!selectedTransactionIDs.length && !transactionThreadReportID;

    const narrowedPrimaryAction = narrowPrimaryAction(primaryAction);

    if (shouldShowSelectedTransactionsButton) {
        return (
            <View style={shouldDisplayNarrowMoreButton ? undefined : [styles.dFlex, styles.w100, styles.ph5, styles.pb3]}>
                <MoneyReportHeaderSelectionDropdown
                    reportID={reportID}
                    primaryAction={narrowedPrimaryAction}
                    onHoldMenuOpen={onHoldMenuOpen}
                    onRejectModalOpen={openRejectModal}
                    startApprovedAnimation={startApprovedAnimation}
                    startSubmittingAnimation={startSubmittingAnimation}
                    wrapperStyle={shouldDisplayNarrowMoreButton ? undefined : styles.w100}
                />
            </View>
        );
    }

    return (
        <View style={[styles.flexRow, styles.gap2, ...(!shouldDisplayNarrowMoreButton ? [styles.pb3, styles.ph5, styles.w100, styles.alignItemsCenter, styles.justifyContentCenter] : [])]}>
            {!!primaryAction && (
                <View style={!shouldDisplayNarrowMoreButton ? [styles.flex1] : undefined}>
                    <MoneyReportHeaderPrimaryAction
                        reportID={reportID}
                        chatReportID={chatReport?.reportID}
                        primaryAction={primaryAction}
                        isPaidAnimationRunning={isPaidAnimationRunning}
                        isApprovedAnimationRunning={isApprovedAnimationRunning}
                        isSubmittingAnimationRunning={isSubmittingAnimationRunning}
                        stopAnimation={stopAnimation}
                        startAnimation={startAnimation}
                        startApprovedAnimation={startApprovedAnimation}
                        startSubmittingAnimation={startSubmittingAnimation}
                        onExportModalOpen={() => triggerExportOrConfirm(CONST.REPORT.EXPORT_OPTIONS.EXPORT_TO_INTEGRATION)}
                    />
                </View>
            )}
            <MoneyReportHeaderSecondaryActions
                reportID={reportID}
                primaryAction={narrowedPrimaryAction}
                onHoldMenuOpen={onHoldMenuOpen}
                onPDFModalOpen={openPDFDownload}
                onHoldEducationalOpen={openHoldEducational}
                onRejectModalOpen={openRejectModal}
                startAnimation={startAnimation}
                startApprovedAnimation={startApprovedAnimation}
                startSubmittingAnimation={startSubmittingAnimation}
                dropdownMenuRef={dropdownMenuRef}
            />
        </View>
    );
}

export default MoneyReportHeaderActions;
export type {MoneyReportHeaderActionsProps};
