/**
 * One tag list of a saved expense on the expense view, as a bordered field whose list opens anchored to it. It is a
 * component of its own because the highlight of a tag list that just appeared is a hook, which runs once per list.
 */
import ExpenseFieldDropdown from '@components/MoneyRequestConfirmationList/sections/ExpenseFieldDropdown';
import TagFieldDropdown from '@components/MoneyRequestConfirmationList/sections/TagFieldDropdown';
import useFieldRowHighlightStyle from '@components/MoneyRequestConfirmationList/sections/useFieldRowHighlightStyle';
import {SELECTION_LIST_POPOVER_HEADER_HEIGHT} from '@components/SelectionListPopoverHeader';

import CONST from '@src/CONST';
import type * as OnyxTypes from '@src/types/onyx';

import type {OnyxEntry} from 'react-native-onyx';

import React from 'react';

type TagFieldRowProps = {
    /** ID of the expense the picked tag is written to */
    transactionID: string;

    /** Policy the tags belong to */
    policy: OnyxEntry<OnyxTypes.Policy>;

    /** Index of the tag list this row picks from */
    tagListIndex: number;

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

    /** Whether the list opens anchored to the row. Otherwise the press goes to `onPress` */
    shouldOpenInDropdown: boolean;

    /** Opens the full-page tag selector, or the alert for a tag that can no longer be picked */
    onPress: () => void;
};

function TagFieldRow({transactionID, policy, tagListIndex, name, value, errorText, shouldHighlight, isInteractive, shouldOpenInDropdown, onPress}: TagFieldRowProps) {
    const highlightStyle = useFieldRowHighlightStyle(shouldHighlight);

    return (
        <ExpenseFieldDropdown
            name={name}
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
                    policy={policy}
                    tagListIndex={tagListIndex}
                />
            )}
            sentryLabel={CONST.SENTRY_LABEL.MONEY_REQUEST_VIEW.TAG_FIELD}
        />
    );
}

export default TagFieldRow;
