import React from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import type {ValueOf} from 'type-fest';
import AttendeeField from '@components/MoneyRequestConfirmationList/sections/AttendeeField';
import CategoryField from '@components/MoneyRequestConfirmationList/sections/CategoryField';
import DateField from '@components/MoneyRequestConfirmationList/sections/DateField';
import TagFields from '@components/MoneyRequestConfirmationList/sections/TagFields';
import TaxFields from '@components/MoneyRequestConfirmationList/sections/TaxFields';
import type CONST from '@src/CONST';
import type {IOUAction, IOUType} from '@src/CONST';
import type * as OnyxTypes from '@src/types/onyx';
import type {FieldVisibility, TagEntry} from './fieldVisibility';

type ClassificationFieldsProps = {
    /** Action being performed (drives section navigation targets) */
    action: IOUAction;

    /** Type of IOU being confirmed */
    iouType: Exclude<IOUType, typeof CONST.IOU.TYPE.REQUEST | typeof CONST.IOU.TYPE.SEND>;

    /** ID of the active transaction */
    transactionID: string | undefined;

    /** ID of the report the transaction belongs to */
    reportID: string;

    /** ID of the originating report action when editing */
    reportActionID: string | undefined;

    /** Active transaction */
    transaction: OnyxEntry<OnyxTypes.Transaction>;

    /** Active policy */
    policy: OnyxEntry<OnyxTypes.Policy>;

    /** Resolved policy used when moving an expense off track-expense (drives tax fallback) */
    policyForMovingExpenses: OnyxEntry<OnyxTypes.Policy> | undefined;

    /** Tag lists configured on the policy (used to look up the list at each tag entry's index) */
    policyTagLists: Array<ValueOf<OnyxTypes.PolicyTagLists>>;

    /** Previous render's per-tag-list `shouldShow` projection (drives `TagFields` transitions) */
    previousTagsVisibility: boolean[];

    /** Whether the surface is read-only */
    isReadOnly: boolean;

    /** Whether the user has confirmed (locks editable controls) */
    didConfirm: boolean;

    /** Whether the categories field is required (drives above-show-more placement) */
    isCategoryRequired: boolean;

    /** Whether tax field modifications are allowed */
    canModifyTaxFields: boolean;

    /** Whether to display per-field validation errors */
    shouldDisplayFieldError: boolean;

    /** Whether navigating to upgrade is required to proceed past blocked workspaces */
    shouldNavigateToUpgradePath: boolean;

    /** Whether the user must select a policy before submitting */
    shouldSelectPolicy: boolean;

    /** ISO currency code for the transaction */
    iouCurrencyCode: string;

    /** Pre-formatted amount-per-attendee string for display */
    formattedAmountPerAttendee: string;

    /** Form-level error message */
    formError: string;

    /** When true, suppresses optional fields (only required Category + required Tags render) */
    isCompactMode: boolean;

    /** Per-field visibility decisions resolved by `computeFieldVisibility` */
    fieldVisibility: Pick<FieldVisibility, 'categoryRequired' | 'categoryOptional' | 'date' | 'tagsRequired' | 'tagsOptional' | 'tax' | 'attendees'>;
};

function ClassificationFields({
    action,
    iouType,
    transactionID,
    reportID,
    reportActionID,
    transaction,
    policy,
    policyForMovingExpenses,
    policyTagLists,
    previousTagsVisibility,
    isReadOnly,
    didConfirm,
    isCategoryRequired,
    canModifyTaxFields,
    shouldDisplayFieldError,
    shouldNavigateToUpgradePath,
    shouldSelectPolicy,
    iouCurrencyCode,
    formattedAmountPerAttendee,
    formError,
    isCompactMode,
    fieldVisibility,
}: ClassificationFieldsProps) {
    const renderTagFields = (entries: TagEntry[]) =>
        entries.map(({name, index, isTagRequired}) => {
            const policyTagList = policyTagLists.at(index);
            if (!policyTagList) {
                return null;
            }
            return (
                <TagFields
                    key={`tag_${name}`}
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
                    transaction={transaction}
                    formError={formError}
                />
            );
        });

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
                    transaction={transaction}
                    formError={formError}
                    shouldNavigateToUpgradePath={shouldNavigateToUpgradePath}
                    shouldSelectPolicy={shouldSelectPolicy}
                />
            )}

            {!isCompactMode && fieldVisibility.date && (
                <DateField
                    shouldDisplayFieldError={shouldDisplayFieldError}
                    didConfirm={didConfirm}
                    isReadOnly={isReadOnly}
                    transactionID={transactionID}
                    action={action}
                    iouType={iouType}
                    reportID={reportID}
                    reportActionID={reportActionID}
                    transaction={transaction}
                />
            )}

            {renderTagFields(fieldVisibility.tagsRequired)}

            {!isCompactMode && renderTagFields(fieldVisibility.tagsOptional)}

            {!isCompactMode && fieldVisibility.tax && (
                <TaxFields
                    policy={policy}
                    policyForMovingExpenses={policyForMovingExpenses}
                    transaction={transaction}
                    iouCurrencyCode={iouCurrencyCode}
                    canModifyTaxFields={canModifyTaxFields}
                    didConfirm={didConfirm}
                    transactionID={transactionID}
                    action={action}
                    iouType={iouType}
                    reportID={reportID}
                    formError={formError}
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
                    formError={formError}
                    transaction={transaction}
                />
            )}
        </>
    );
}

export default ClassificationFields;
