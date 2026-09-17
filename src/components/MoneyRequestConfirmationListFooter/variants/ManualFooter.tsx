import {useConfirmationFields} from '@components/MoneyRequestConfirmationFields/context';
import AddReceiptButton from '@components/MoneyRequestConfirmationList/sections/AddReceiptButton';
import ConfirmationFieldList from '@components/MoneyRequestConfirmationListFooter/ConfirmationFieldList';
import ManualDetailsFields from '@components/MoneyRequestConfirmationListFooter/fieldGroups/detailsFields/ManualDetailsFields';
import ReceiptSection from '@components/MoneyRequestConfirmationListFooter/sections/ReceiptSection';
import type {ManualFooterProps} from '@components/MoneyRequestConfirmationListFooter/types';
import Text from '@components/Text';

import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

import {shouldShowReceiptEmptyState} from '@libs/IOUUtils';

import React from 'react';
import {View} from 'react-native';

/**
 * Footer for manually entered expenses, and the dispatcher's residual case: it also serves pay, per-diem being
 * moved off a track expense, and a time expense outside CREATE, all of which confirm as a plain expense.
 *
 * This is the one form that gives every selectable row the same bordered treatment as its text fields, so the
 * whole section reads as one set of details rather than as several lists stacked together.
 */
function ManualFooter({policy, policyTags, selectedParticipants, amountDisplay, requiredFlags, visibilityFlags, errorState, toggleHandlers = {}, receiptOptions}: ManualFooterProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {action, iouType, isPerDiemRequest, isReadOnly} = useConfirmationFields();

    // Both the header copy and the add-receipt button key off whether the section already shows a receipt. The
    // preview renders on exactly these inputs (see `useReceiptThumbnailSource`), so the two cannot disagree.
    const hasReceipt = (!!receiptOptions.receiptPath && !!receiptOptions.receiptFilename) || !!receiptOptions.isLoadingReceipt;
    const canAddReceipt = !isReadOnly && shouldShowReceiptEmptyState(iouType, action, policy, isPerDiemRequest);

    return (
        <View>
            {/* Separates the workspace row above from the expense details, so the two read as distinct sections. */}
            {visibilityFlags.hasParticipantSection && <View style={styles.dividerLine} />}

            <View style={[styles.optionsListSectionHeader, styles.justifyContentCenter]}>
                <Text style={[styles.ph5, styles.textLabelSupporting]}>{hasReceipt ? translate('common.receipt') : translate('iou.expenseDetails')}</Text>
            </View>

            <ReceiptSection
                policy={policy}
                shouldHideEmptyState
                {...receiptOptions}
            />

            <ConfirmationFieldList
                policy={policy}
                policyTags={policyTags}
                selectedParticipants={selectedParticipants}
                amountDisplay={amountDisplay}
                requiredFlags={requiredFlags}
                visibilityFlags={visibilityFlags}
                errorState={errorState}
                toggleHandlers={toggleHandlers}
                shouldUseDropdownRows
            >
                <ManualDetailsFields
                    policy={policy}
                    amountDisplay={amountDisplay}
                    requiredFlags={requiredFlags}
                    errorState={errorState}
                    isParticipantPickerVisible={visibilityFlags.isParticipantPickerVisible}
                    amountTrailingAction={!hasReceipt && canAddReceipt ? <AddReceiptButton /> : undefined}
                    shouldUseBorderlessAmountButtons
                />
            </ConfirmationFieldList>
        </View>
    );
}

export default ManualFooter;
