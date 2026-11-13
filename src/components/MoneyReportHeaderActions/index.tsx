import type {ButtonWithDropdownMenuRef} from '@components/ButtonWithDropdownMenu/types';
import MoneyReportHeaderPrimaryAction from '@components/MoneyReportHeaderPrimaryAction';
import {useMoneyReportTransactionThread} from '@components/MoneyReportTransactionThreadContext';
import {useSearchSelectionActions, useSearchSelectionContext} from '@components/Search/SearchContext';

import useExportAgainModal from '@hooks/useExportAgainModal';
import useLayoutSpacing from '@hooks/useLayoutSpacing';
import useOnyx from '@hooks/useOnyx';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useResponsiveLayoutOnWideRHP from '@hooks/useResponsiveLayoutOnWideRHP';
import useThemeStyles from '@hooks/useThemeStyles';

import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import type {ValueOf} from 'type-fest';

import React, {useEffect, useRef} from 'react';
import {View} from 'react-native';

import type {MoneyReportHeaderActionsProps} from './types';

import MoneyReportHeaderSecondaryActions from './MoneyReportHeaderSecondaryActions';
import MoneyReportHeaderSelectionDropdown from './MoneyReportHeaderSelectionDropdown';

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
    const {pageGutter} = useLayoutSpacing();
    const dropdownMenuRef = useRef<ButtonWithDropdownMenuRef>(null) as React.RefObject<ButtonWithDropdownMenuRef>;

    const {shouldUseNarrowLayout, isMediumScreenWidth, isInLandscapeMode} = useResponsiveLayout();
    const shouldDisplayNarrowVersion = shouldUseNarrowLayout || isMediumScreenWidth;
    const {isWideRHPDisplayedOnWideLayout, isSuperWideRHPDisplayedOnWideLayout, shouldUseNarrowLayout: shouldUseNarrowLayoutOnWideRHP} = useResponsiveLayoutOnWideRHP();
    const shouldDisplayNarrowMoreButton = isInLandscapeMode || !shouldDisplayNarrowVersion || isWideRHPDisplayedOnWideLayout || isSuperWideRHPDisplayedOnWideLayout;

    const [moneyRequestReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`);
    const [chatReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${getNonEmptyStringOnyxID(moneyRequestReport?.chatReportID)}`);

    const {transactionThreadReportID} = useMoneyReportTransactionThread();

    const {triggerExportOrConfirm} = useExportAgainModal(moneyRequestReport?.reportID, moneyRequestReport?.policyID);

    const {selectedTransactionIDs} = useSearchSelectionContext();
    const {clearSelectedTransactions} = useSearchSelectionActions();
    const hasSelectedTransactions = !!selectedTransactionIDs.length;
    const isTransactionThread = !!transactionThreadReportID;

    useEffect(() => {
        if (!transactionThreadReportID) {
            return;
        }

        clearSelectedTransactions(true);
    }, [transactionThreadReportID]); // eslint-disable-line react-hooks/exhaustive-deps

    // Report-level actions must not be usable while expenses are selected, otherwise they get mixed up with the bulk expense actions.
    const shouldDisableReportActions = hasSelectedTransactions && !isTransactionThread;

    const narrowedPrimaryAction = narrowPrimaryAction(primaryAction);

    // A wide layout acts on the selection through the bulk action bar floating over the list instead, so the report's own
    // actions stay in the header but are disabled while a selection is being built up.
    if (shouldDisableReportActions && shouldUseNarrowLayoutOnWideRHP) {
        return (
            <View style={shouldDisplayNarrowMoreButton ? undefined : [styles.dFlex, styles.w100, pageGutter, styles.pb3]}>
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
        <View style={[styles.flexRow, styles.gap2, ...(!shouldDisplayNarrowMoreButton ? [styles.pb3, pageGutter, styles.w100, styles.alignItemsCenter, styles.justifyContentCenter] : [])]}>
            {!!primaryAction && (
                <View style={!shouldDisplayNarrowMoreButton ? [styles.flex1] : undefined}>
                    <MoneyReportHeaderPrimaryAction
                        reportID={reportID}
                        chatReportID={chatReport?.reportID}
                        primaryAction={primaryAction}
                        onExportModalOpen={() => triggerExportOrConfirm(CONST.REPORT.EXPORT_OPTIONS.EXPORT_TO_INTEGRATION)}
                        isDisabled={shouldDisableReportActions}
                    />
                </View>
            )}
            <MoneyReportHeaderSecondaryActions
                reportID={reportID}
                primaryAction={narrowedPrimaryAction}
                isReportInSearch={isReportInSearch}
                backTo={backTo}
                dropdownMenuRef={dropdownMenuRef}
                isDisabled={shouldDisableReportActions}
            />
        </View>
    );
}

export default MoneyReportHeaderActions;
