import type {ProviderProps} from '@components/MoneyRequestConfirmationFields/Provider';
import ConfirmationFieldsProvider from '@components/MoneyRequestConfirmationFields/Provider';
import BareUserListItem from '@components/SelectionList/ListItem/BareUserListItem';
import SelectionListWithSections from '@components/SelectionList/SelectionListWithSections';
import type {Section, SelectionListWithSectionsHandle} from '@components/SelectionList/SelectionListWithSections/types';

import {MouseProvider} from '@hooks/useMouseContext';
import useThemeStyles from '@hooks/useThemeStyles';

import type {ReactNode, RefObject} from 'react';

import React from 'react';
import {View} from 'react-native';

import type {ConfirmationFooterContentProps} from './ConfirmationFooterContent';
import type {MoneyRequestConfirmationListItem} from './types';

import ConfirmationFooterContent from './ConfirmationFooterContent';
import ConfirmationTelemetry from './ConfirmationTelemetry';

/** The expense-type flags a variant sets on `ConfirmationFieldsProvider`. Everything else on it is shared and comes from the hook. */
type ConfirmationFieldFlags = Pick<
    ProviderProps,
    'isScanRequest' | 'isDistanceRequest' | 'isPerDiemRequest' | 'isTimeRequest' | 'isTypeInvoice' | 'isManualDistanceRequest' | 'isOdometerDistanceRequest' | 'isGPSDistanceRequest'
>;

type ConfirmationListLayoutProps = {
    /** ID of the transaction being confirmed. Closes the list-ready telemetry span once it is available. */
    transactionID: string | undefined;

    /** Participant rows to render. Every expense field lives in `listFooterContent` instead. */
    sections: Array<Section<MoneyRequestConfirmationListItem>>;

    /** Lets the surface scroll an inline footer field into view when it is focused */
    listRef: RefObject<SelectionListWithSectionsHandle | null>;

    /** Read-only list: no confirm button */
    isReadOnly: boolean;

    /** The footer for the expense type, rendered inside the fields context below the participant rows */
    listFooterContent: React.JSX.Element | null | undefined;

    /** Inputs of the fields context that are the same for every expense type */
    confirmationFieldsProviderProps: Omit<ProviderProps, keyof ConfirmationFieldFlags | 'children'>;

    /** The expense-type flags a variant sets on the fields context */
    fieldFlags?: ConfirmationFieldFlags;

    /**
     * Side-effect controllers. They render before the list on purpose: their effects flush before the footer fields'
     * effects, so for example `TaxController` seeds `taxCode`/`taxAmount` before `TaxFields` reads them. They are
     * components rather than hooks in the variant because a hook's effect would run after the children's, and because
     * fields can be unmounted (the compact scan layout hides them behind "Show more") while the seeding must still run.
     */
    children?: ReactNode;

    /** Whether the receipt is shown with the fields collapsed behind "Show more". Only a scan expense reaches this. */
    isCompactMode?: boolean;

    /** Opens the participant picker */
    onSelectRow: () => void;

    /** Clears the errors rendered on a participant row */
    onDismissError: () => void;

    /** Inputs of the confirm button block rendered below the list. Not rendered when read-only. */
    footerContentProps: ConfirmationFooterContentProps;
};

/**
 * Layout every confirmation shares: the participant list, the fields below it, and the confirm button.
 */
function ConfirmationListLayout({
    transactionID,
    sections,
    listRef,
    isReadOnly,
    listFooterContent,
    confirmationFieldsProviderProps,
    fieldFlags,
    children,
    isCompactMode = false,
    onSelectRow,
    onDismissError,
    footerContentProps,
}: ConfirmationListLayoutProps) {
    const styles = useThemeStyles();

    // The list drops its bottom safe-area padding only when there is no footer, so the read-only case must pass
    // `undefined` rather than a footer that renders nothing.
    const footerContent = isReadOnly ? undefined : <ConfirmationFooterContent {...footerContentProps} />;

    const fieldsContent = (
        <ConfirmationFieldsProvider
            {...confirmationFieldsProviderProps}
            {...fieldFlags}
        >
            <View style={isCompactMode ? styles.flex1 : undefined}>{listFooterContent}</View>
        </ConfirmationFieldsProvider>
    );

    const selectionListStyle = {
        containerStyle: [styles.flexBasisAuto],
        contentContainerStyle: isCompactMode ? [styles.flexGrow1] : undefined,
        listFooterContentStyle: isCompactMode ? [styles.flex1, styles.mb3] : [styles.mb3],
    };

    return (
        <MouseProvider>
            {/* Controllers go before the list so their effects run before the fields' effects */}
            {children}
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
                listFooterContent={fieldsContent}
                style={selectionListStyle}
                disableKeyboardShortcuts
            />
        </MouseProvider>
    );
}

export default ConfirmationListLayout;
export type {ConfirmationListLayoutProps};
