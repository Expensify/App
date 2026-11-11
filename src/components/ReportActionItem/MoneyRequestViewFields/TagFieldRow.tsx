import ExpenseFieldDropdown from '@components/MoneyRequestConfirmationList/sections/ExpenseFieldDropdown';
import useFieldRowHighlightStyle from '@components/MoneyRequestConfirmationList/sections/useFieldRowHighlightStyle';
import {SELECTION_LIST_POPOVER_HEADER_HEIGHT} from '@components/SelectionListPopoverHeader';

import CONST from '@src/CONST';
import type * as OnyxTypes from '@src/types/onyx';

import type {OnyxEntry} from 'react-native-onyx';

import React from 'react';

import TagFieldDropdown from './TagFieldDropdown';

type TagFieldRowProps = {
    /** Name of the tag list */
    name: string;

    /** Tag the expense holds in this list */
    value: string;

    /** Violation message for this tag list */
    errorText: string;

    /** Whether the row flashes, for a dependent tag list that just appeared */
    shouldHighlight: boolean;

    /** Whether the tag can be changed */
    isInteractive: boolean;

    /** Whether the list opens anchored to the row. Otherwise the press goes to `onPress`. */
    shouldOpenInDropdown: boolean;

    /** Opens the full-page tag selector, or the alert for a disabled tag */
    onPress: () => void;

    /** ID of the expense the picked value is written to */
    transactionID: string;

    /** Expense the picked tag is written to */
    transaction: OnyxEntry<OnyxTypes.Transaction>;

    /** Transaction thread report of the expense */
    transactionThreadReport: OnyxEntry<OnyxTypes.Report>;

    /** Policy the tags belong to */
    policy: OnyxEntry<OnyxTypes.Policy>;

    /** Index of the tag list this row picks from */
    tagListIndex: number;
};

/** One tag list of a saved expense, as a bordered field whose list opens anchored to it */
function TagFieldRow({
    name,
    value,
    errorText,
    shouldHighlight,
    isInteractive,
    shouldOpenInDropdown,
    onPress,
    transactionID,
    transaction,
    transactionThreadReport,
    policy,
    tagListIndex,
}: TagFieldRowProps) {
    const highlightStyle = useFieldRowHighlightStyle(shouldHighlight);

    return (
        <ExpenseFieldDropdown
            name={name}
            sentryLabel={CONST.SENTRY_LABEL.MONEY_REQUEST_VIEW.TAG_FIELD}
            value={value}
            numberOfLinesValue={2}
            copyValue={value || undefined}
            errorText={errorText}
            backgroundStyle={highlightStyle}
            isInteractive={isInteractive}
            onPress={onPress}
            shouldOpenInDropdown={shouldOpenInDropdown}
            listHeaderHeight={SELECTION_LIST_POPOVER_HEADER_HEIGHT}
            renderDropdown={(dropdownProps) => (
                <TagFieldDropdown
                    {...dropdownProps}
                    transactionID={transactionID}
                    transaction={transaction}
                    transactionThreadReport={transactionThreadReport}
                    policy={policy}
                    tagListIndex={tagListIndex}
                />
            )}
        />
    );
}

export default TagFieldRow;
