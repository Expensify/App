import React from 'react';
import type {StyleProp, ViewStyle} from 'react-native';
import {View} from 'react-native';
import type {ValueOf} from 'type-fest';
import type {ButtonWithDropdownMenuRef} from '@components/ButtonWithDropdownMenu/types';
import type {RejectModalAction} from '@components/MoneyReportHeaderEducationalModals';
import MoneyReportHeaderPrimaryAction from '@components/MoneyReportHeaderPrimaryAction';
import useThemeStyles from '@hooks/useThemeStyles';
import CONST from '@src/CONST';
import type {PaymentMethodType} from '@src/types/onyx/OriginalMessage';
import MoneyReportHeaderSecondaryActions from './MoneyReportHeaderSecondaryActions';
import MoneyReportHeaderSelectionDropdown from './MoneyReportHeaderSelectionDropdown';

type MoneyReportHeaderActionsBarProps = {
    reportID: string | undefined;
    chatReportID: string | undefined;
    primaryAction: ValueOf<typeof CONST.REPORT.PRIMARY_ACTIONS> | ValueOf<typeof CONST.REPORT.TRANSACTION_PRIMARY_ACTIONS> | '';
    shouldDisplayNarrowMoreButton: boolean;
    shouldShowSelectedTransactionsButton: boolean;

    // Animation
    isPaidAnimationRunning: boolean;
    isApprovedAnimationRunning: boolean;
    isSubmittingAnimationRunning: boolean;
    stopAnimation: () => void;
    startAnimation: () => void;
    startApprovedAnimation: () => void;
    startSubmittingAnimation: () => void;

    // Modal triggers
    onHoldMenuOpen: (requestType: string, paymentType?: PaymentMethodType, methodID?: number) => void;
    onExportModalOpen: () => void;
    onPDFModalOpen: () => void;
    onHoldEducationalOpen: () => void;
    onRejectModalOpen: (action: RejectModalAction) => void;

    dropdownMenuRef: React.RefObject<ButtonWithDropdownMenuRef>;
};

/**
 * Narrow the wide primaryAction union to what report-level secondary actions accept.
 * TRANSACTION_PRIMARY_ACTIONS values (e.g. "keepThisOne") are irrelevant here.
 */
function narrowPrimaryAction(primaryAction: MoneyReportHeaderActionsBarProps['primaryAction']): ValueOf<typeof CONST.REPORT.PRIMARY_ACTIONS> | '' {
    if ((Object.values(CONST.REPORT.PRIMARY_ACTIONS) as string[]).includes(primaryAction)) {
        return primaryAction as ValueOf<typeof CONST.REPORT.PRIMARY_ACTIONS>;
    }
    return '';
}

/**
 * Lays out primary action, secondary (more) menu, and search selection dropdown
 * based on selection mode and narrow vs wide header constraints.
 */
function MoneyReportHeaderActionsBar({
    reportID,
    chatReportID,
    primaryAction,
    shouldDisplayNarrowMoreButton,
    shouldShowSelectedTransactionsButton,
    isPaidAnimationRunning,
    isApprovedAnimationRunning,
    isSubmittingAnimationRunning,
    stopAnimation,
    startAnimation,
    startApprovedAnimation,
    startSubmittingAnimation,
    onHoldMenuOpen,
    onExportModalOpen,
    onPDFModalOpen,
    onHoldEducationalOpen,
    onRejectModalOpen,
    dropdownMenuRef,
}: MoneyReportHeaderActionsBarProps) {
    const styles = useThemeStyles();
    const narrowedPrimaryAction = narrowPrimaryAction(primaryAction);
    const selectionDropdownWrapperStyle: StyleProp<ViewStyle> = shouldDisplayNarrowMoreButton ? undefined : styles.w100;

    if (shouldShowSelectedTransactionsButton) {
        return (
            <View style={shouldDisplayNarrowMoreButton ? undefined : [styles.dFlex, styles.w100, styles.ph5, styles.pb3]}>
                <MoneyReportHeaderSelectionDropdown
                    reportID={reportID}
                    primaryAction={narrowedPrimaryAction}
                    onHoldMenuOpen={onHoldMenuOpen}
                    onRejectModalOpen={onRejectModalOpen}
                    startApprovedAnimation={startApprovedAnimation}
                    startSubmittingAnimation={startSubmittingAnimation}
                    wrapperStyle={selectionDropdownWrapperStyle}
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
                        chatReportID={chatReportID}
                        primaryAction={primaryAction}
                        isPaidAnimationRunning={isPaidAnimationRunning}
                        isApprovedAnimationRunning={isApprovedAnimationRunning}
                        isSubmittingAnimationRunning={isSubmittingAnimationRunning}
                        stopAnimation={stopAnimation}
                        startAnimation={startAnimation}
                        startApprovedAnimation={startApprovedAnimation}
                        startSubmittingAnimation={startSubmittingAnimation}
                        onHoldMenuOpen={onHoldMenuOpen}
                        onExportModalOpen={onExportModalOpen}
                    />
                </View>
            )}
            <MoneyReportHeaderSecondaryActions
                reportID={reportID}
                primaryAction={narrowedPrimaryAction}
                onHoldMenuOpen={onHoldMenuOpen}
                onPDFModalOpen={onPDFModalOpen}
                onHoldEducationalOpen={onHoldEducationalOpen}
                onRejectModalOpen={onRejectModalOpen}
                startAnimation={startAnimation}
                startApprovedAnimation={startApprovedAnimation}
                startSubmittingAnimation={startSubmittingAnimation}
                dropdownMenuRef={dropdownMenuRef}
            />
        </View>
    );
}

export default MoneyReportHeaderActionsBar;
export type {MoneyReportHeaderActionsBarProps};
