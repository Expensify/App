import BareUserListItem from '@components/SelectionList/ListItem/BareUserListItem';
import SelectionListWithSections from '@components/SelectionList/SelectionListWithSections';
import type {Section, SelectionListWithSectionsHandle} from '@components/SelectionList/SelectionListWithSections/types';

import {MouseProvider} from '@hooks/useMouseContext';
import useThemeStyles from '@hooks/useThemeStyles';

import type {RefObject} from 'react';

import React from 'react';

import type {MoneyRequestConfirmationListItem} from './types';

import {useConfirmationData} from './ConfirmationDataContext';
import ConfirmationFooterContent from './ConfirmationFooterContent';
import ConfirmationTelemetry from './ConfirmationTelemetry';

type ConfirmationListLayoutProps = {
    /** ID of the transaction being confirmed. Closes the list-ready telemetry span once it is available. */
    transactionID: string | undefined;

    /** Participant rows to render. Every expense field lives in `listFooterContent` instead. */
    sections: Array<Section<MoneyRequestConfirmationListItem>>;

    /** Lets the surface scroll an inline footer field into view when it is focused */
    listRef: RefObject<SelectionListWithSectionsHandle | null>;

    /** The expense fields for the type being confirmed */
    listFooterContent: React.JSX.Element | null | undefined;

    /** Whether the receipt is shown with the fields collapsed behind "Show more". Only a scan expense reaches this. */
    isCompactMode?: boolean;

    /** Opens the participant picker */
    onSelectRow: () => void;

    /** Clears the errors rendered on a participant row */
    onDismissError: () => void;
};

/**
 * Layout every confirmation shares: the participant list, the fields below it, and the confirm button.
 */
function ConfirmationListLayout({transactionID, sections, listRef, listFooterContent, isCompactMode = false, onSelectRow, onDismissError}: ConfirmationListLayoutProps) {
    const styles = useThemeStyles();
    const {isReadOnly} = useConfirmationData();

    // The list drops its bottom safe-area padding only when there is no footer, so the read-only case must pass
    // `undefined` rather than a footer that renders nothing.
    const footerContent = isReadOnly ? undefined : <ConfirmationFooterContent />;

    const selectionListStyle = {
        containerStyle: [styles.flexBasisAuto],
        contentContainerStyle: isCompactMode ? [styles.flexGrow1] : undefined,
        listFooterContentStyle: isCompactMode ? [styles.flex1, styles.mb3] : [styles.mb3],
    };

    return (
        <MouseProvider>
            <ConfirmationTelemetry transactionID={transactionID} />
            <SelectionListWithSections<MoneyRequestConfirmationListItem>
                ref={listRef}
                sections={sections}
                ListItem={BareUserListItem}
                onSelectRow={onSelectRow}
                onDismissError={onDismissError}
                shouldSingleExecuteRowSelect
                shouldPreventDefaultFocusOnSelectRow
                shouldShowListEmptyContent={false}
                footerContent={footerContent}
                listFooterContent={listFooterContent}
                style={selectionListStyle}
                // The rows of this list are the expense's own fields, so a tap that none of them claims is a tap
                // outside the focused field and has to dismiss the keyboard. The list's default (`always`) is for
                // lists whose rows are driven by a search input that must keep focus through a row press.
                //
                // Deliberately set for every confirmation variant, not just the manual form the complaint came
                // from: none of them is search-driven, so `always` was wrong for all of them.
                keyboardShouldPersistTaps="handled"
                disableKeyboardShortcuts
            />
        </MouseProvider>
    );
}

export default ConfirmationListLayout;
