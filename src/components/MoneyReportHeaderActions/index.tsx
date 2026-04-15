import React, {useEffect, useRef} from 'react';
import {View} from 'react-native';
import type {ValueOf} from 'type-fest';
import type {ButtonWithDropdownMenuRef} from '@components/ButtonWithDropdownMenu/types';
import MoneyReportHeaderPrimaryAction from '@components/MoneyReportHeaderPrimaryAction';
import {useSearchActionsContext, useSearchStateContext} from '@components/Search/SearchContext';
import useExportAgainModal from '@hooks/useExportAgainModal';
import useOnyx from '@hooks/useOnyx';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useResponsiveLayoutOnWideRHP from '@hooks/useResponsiveLayoutOnWideRHP';
import useThemeStyles from '@hooks/useThemeStyles';
import useTransactionThreadReport from '@hooks/useTransactionThreadReport';
import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import MoneyReportHeaderSecondaryActions from './MoneyReportHeaderSecondaryActions';
import MoneyReportHeaderSelectionDropdown from './MoneyReportHeaderSelectionDropdown';
import type {MoneyReportHeaderActionsProps} from './types';

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

function MoneyReportHeaderActions({reportID, primaryAction, isReportInSearch, backTo}: MoneyReportHeaderActionsProps) {
    const styles = useThemeStyles();
    const dropdownMenuRef = useRef<ButtonWithDropdownMenuRef>(null) as React.RefObject<ButtonWithDropdownMenuRef>;

    // We need isSmallScreenWidth for the hold expense modal layout https://github.com/Expensify/App/pull/47990#issuecomment-2362382026
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth
    const {shouldUseNarrowLayout, isMediumScreenWidth} = useResponsiveLayout();
    const shouldDisplayNarrowVersion = shouldUseNarrowLayout || isMediumScreenWidth;
    const {isWideRHPDisplayedOnWideLayout, isSuperWideRHPDisplayedOnWideLayout} = useResponsiveLayoutOnWideRHP();
    const shouldDisplayNarrowMoreButton = !shouldDisplayNarrowVersion || isWideRHPDisplayedOnWideLayout || isSuperWideRHPDisplayedOnWideLayout;

    const [moneyRequestReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`);
    const [chatReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${getNonEmptyStringOnyxID(moneyRequestReport?.chatReportID)}`);

    const {transactionThreadReportID} = useTransactionThreadReport(reportID);

    const {triggerExportOrConfirm} = useExportAgainModal(moneyRequestReport?.reportID, moneyRequestReport?.policyID);

    const {selectedTransactionIDs} = useSearchStateContext();
    const {clearSelectedTransactions} = useSearchActionsContext();
    const hasSelectedTransactions = !!selectedTransactionIDs.length;
    const isTransactionThread = !!transactionThreadReportID;

    useEffect(() => {
        if (!transactionThreadReportID) {
            return;
        }

        clearSelectedTransactions(true);
    }, [transactionThreadReportID]); // eslint-disable-line react-hooks/exhaustive-deps

    const narrowedPrimaryAction = narrowPrimaryAction(primaryAction);

    if (hasSelectedTransactions && !isTransactionThread) {
        return (
            <View style={shouldDisplayNarrowMoreButton ? undefined : [styles.dFlex, styles.w100, styles.ph5, styles.pb3]}>
                <MoneyReportHeaderSelectionDropdown
                    reportID={reportID}
                    primaryAction={narrowedPrimaryAction}
                    isReportInSearch={isReportInSearch}
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
                        onExportModalOpen={() => triggerExportOrConfirm(CONST.REPORT.EXPORT_OPTIONS.EXPORT_TO_INTEGRATION)}
                    />
                </View>
            )}
            <MoneyReportHeaderSecondaryActions
                reportID={reportID}
                primaryAction={narrowedPrimaryAction}
                isReportInSearch={isReportInSearch}
                backTo={backTo}
                dropdownMenuRef={dropdownMenuRef}
            />
        </View>
    );
}

export default MoneyReportHeaderActions;
export type {MoneyReportHeaderActionsProps};
