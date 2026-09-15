import BareUserListItem from '@components/SelectionList/ListItem/BareUserListItem';
import SelectionListWithSections from '@components/SelectionList/SelectionListWithSections';
import type {Section, SelectionListWithSectionsHandle} from '@components/SelectionList/SelectionListWithSections/types';

import {MouseProvider} from '@hooks/useMouseContext';
import useThemeStyles from '@hooks/useThemeStyles';

import type {ReactNode, RefObject} from 'react';

import React from 'react';

import type {MoneyRequestConfirmationListItem} from './types';

import ConfirmationTelemetry from './ConfirmationTelemetry';

type ConfirmationListLayoutProps = {
    /** ID of the transaction being confirmed. Closes the list-ready telemetry span once it is available. */
    transactionID: string | undefined;

    /** Participant rows to render. Every expense field lives in `listFooterContent` instead. */
    sections: Array<Section<MoneyRequestConfirmationListItem>>;

    /** Lets the surface scroll an inline footer field into view when it is focused */
    listRef: RefObject<SelectionListWithSectionsHandle | null>;

    /** The confirm button and its error message. Omitted when the surface is read-only. */
    footerContent: ReactNode;

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
 * The chrome every confirmation shares: the participant list, the fields below it, and the confirm button. What
 * differs per expense type is passed in as `listFooterContent`.
 */
function ConfirmationListLayout({transactionID, sections, listRef, footerContent, listFooterContent, isCompactMode = false, onSelectRow, onDismissError}: ConfirmationListLayoutProps) {
    const styles = useThemeStyles();

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
                disableKeyboardShortcuts
            />
        </MouseProvider>
    );
}

export default ConfirmationListLayout;
