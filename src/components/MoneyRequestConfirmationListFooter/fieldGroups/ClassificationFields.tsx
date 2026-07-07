import {useConfirmationFields} from '@components/MoneyRequestConfirmationFields/context';
import AttendeeField from '@components/MoneyRequestConfirmationList/sections/AttendeeField';
import CategoryField from '@components/MoneyRequestConfirmationList/sections/CategoryField';
import DateField from '@components/MoneyRequestConfirmationList/sections/DateField';
import TagFields from '@components/MoneyRequestConfirmationList/sections/TagFields';
import TaxFields from '@components/MoneyRequestConfirmationList/sections/TaxFields';
import type {ErrorState} from '@components/MoneyRequestConfirmationListFooter/fieldGroupTypes';

import type * as OnyxTypes from '@src/types/onyx';

import type {OnyxEntry} from 'react-native-onyx';
import type {ValueOf} from 'type-fest';

import React from 'react';

import type {FieldVisibility, TagEntry} from './fieldVisibility';

type TagFieldRowProps = {
    /** Tag entry to render (carries name, index, and required flag) */
    entry: TagEntry;

    /** Tag lists configured on the policy (used to look up the list at the entry's index) */
    policyTagLists: Array<ValueOf<OnyxTypes.PolicyTagLists>>;

    /** Previous render's per-tag-list `shouldShow` projection (drives transition styling) */
    previousTagsVisibility: boolean[];

    /** Form-level error message */
    formError: string;
};

function TagFieldRow({entry: {index, isTagRequired}, policyTagLists, previousTagsVisibility, formError}: TagFieldRowProps) {
    const {action, iouType, transactionID, reportID, reportActionID, isReadOnly, didConfirm} = useConfirmationFields();
    const policyTagList = policyTagLists.at(index);
    if (!policyTagList) {
        return null;
    }
    return (
        <TagFields
            tagIndex={index}
            policyTagList={policyTagList}
            isTagRequired={isTagRequired}
            previousShouldShow={previousTagsVisibility.at(index) ?? false}
            didConfirm={didConfirm}
            isReadOnly={isReadOnly}
            transactionID={transactionID}
            action={action}
            iouType={iouType}
            reportID={reportID}
            reportActionID={reportActionID}
            formError={formError}
        />
    );
}

type ClassificationFieldsProps = {
    /** Active policy (read by Category/Tax) */
    policy: OnyxEntry<OnyxTypes.Policy>;

    /** Resolved policy used when moving an expense off track-expense (drives tax fallback) */
    policyForMovingExpenses: OnyxEntry<OnyxTypes.Policy> | undefined;

    /** Tag lists configured on the policy (used to look up the list at each tag entry's index) */
    policyTagLists: Array<ValueOf<OnyxTypes.PolicyTagLists>>;

    /** Previous render's per-tag-list `shouldShow` projection (drives `TagFields` transitions) */
    previousTagsVisibility: boolean[];

    /** Whether the categories field is required (drives above-show-more placement) */
    isCategoryRequired: boolean;

    /** Whether tax field modifications are allowed */
    canModifyTaxFields: boolean;

    /** Error state surfaced into multiple fields */
    errorState: ErrorState;

    /** Whether navigating to upgrade is required to proceed past blocked workspaces */
    shouldNavigateToUpgradePath: boolean;

    /** Whether the user must select a policy before submitting */
    shouldSelectPolicy: boolean;

    /** ISO currency code for the transaction */
    iouCurrencyCode: string;

    /** Pre-formatted amount-per-attendee string for display */
    formattedAmountPerAttendee: string;

    /** When true, suppresses optional fields (only required Category + required Tags render) */
    isCompactMode: boolean;

    /** Per-field visibility decisions resolved by `computeFieldVisibility` */
    fieldVisibility: Pick<FieldVisibility, 'categoryRequired' | 'categoryOptional' | 'date' | 'tagsRequired' | 'tagsOptional' | 'tax' | 'attendees'>;
};

function ClassificationFields({
    policy,
    policyForMovingExpenses,
    policyTagLists,
    previousTagsVisibility,
    isCategoryRequired,
    canModifyTaxFields,
    errorState,
    shouldNavigateToUpgradePath,
    shouldSelectPolicy,
    iouCurrencyCode,
    formattedAmountPerAttendee,
    isCompactMode,
    fieldVisibility,
}: ClassificationFieldsProps) {
    const {action, iouType, transactionID, reportID, reportActionID, isReadOnly, didConfirm, isNewManualExpenseFlowEnabled} = useConfirmationFields();

    return (
        <>
            {(fieldVisibility.categoryRequired || (!isCompactMode && fieldVisibility.categoryOptional)) && (
                <CategoryField
                    isCategoryRequired={isCategoryRequired}
                    didConfirm={didConfirm}
                    isReadOnly={isReadOnly}
                    transactionID={transactionID}
                    action={action}
                    iouType={iouType}
                    reportID={reportID}
                    reportActionID={reportActionID}
                    policy={policy}
                    formError={errorState.formError}
                    shouldNavigateToUpgradePath={shouldNavigateToUpgradePath}
                    shouldSelectPolicy={shouldSelectPolicy}
                />
            )}

            {!isCompactMode && fieldVisibility.date && (
                <DateField
                    shouldDisplayFieldError={errorState.shouldDisplayFieldError}
                    didConfirm={didConfirm}
                    isReadOnly={isReadOnly}
                    isNewManualExpenseFlowEnabled={isNewManualExpenseFlowEnabled}
                    formError={errorState.formError}
                    clearFormErrors={errorState.clearFormErrors}
                    transactionID={transactionID}
                    action={action}
                    iouType={iouType}
                    reportID={reportID}
                    reportActionID={reportActionID}
                />
            )}

            {fieldVisibility.tagsRequired.map((entry) => (
                <TagFieldRow
                    key={`tag_${entry.name}`}
                    entry={entry}
                    policyTagLists={policyTagLists}
                    previousTagsVisibility={previousTagsVisibility}
                    formError={errorState.formError}
                />
            ))}

            {!isCompactMode &&
                fieldVisibility.tagsOptional.map((entry) => (
                    <TagFieldRow
                        key={`tag_${entry.name}`}
                        entry={entry}
                        policyTagLists={policyTagLists}
                        previousTagsVisibility={previousTagsVisibility}
                        formError={errorState.formError}
                    />
                ))}

            {!isCompactMode && fieldVisibility.tax && (
                <TaxFields
                    policy={policy}
                    policyForMovingExpenses={policyForMovingExpenses}
                    iouCurrencyCode={iouCurrencyCode}
                    canModifyTaxFields={canModifyTaxFields}
                    didConfirm={didConfirm}
                    transactionID={transactionID}
                    action={action}
                    iouType={iouType}
                    reportID={reportID}
                    formError={errorState.formError}
                    clearFormErrors={errorState.clearFormErrors}
                />
            )}

            {!isCompactMode && fieldVisibility.attendees && (
                <AttendeeField
                    formattedAmountPerAttendee={formattedAmountPerAttendee}
                    isReadOnly={isReadOnly}
                    transactionID={transactionID}
                    action={action}
                    iouType={iouType}
                    reportID={reportID}
                    formError={errorState.formError}
                />
            )}
        </>
    );
}

export default ClassificationFields;
