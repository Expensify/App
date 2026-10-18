import {render, screen} from '@testing-library/react-native';

import ConfirmationFieldsProvider from '@components/MoneyRequestConfirmationFields/Provider';
import {useExpenseFormLayout} from '@components/MoneyRequestConfirmationList/sections/ExpenseFormLayoutContext';
import ExpenseFormFooterLayout from '@components/MoneyRequestConfirmationListFooter/ExpenseFormFooterLayout';
import type {ReceiptOptions} from '@components/MoneyRequestConfirmationListFooter/fieldGroupTypes';
import Text from '@components/Text';

import {isRecord} from '@libs/ObjectUtils';

import CONST from '@src/CONST';

import type {ComponentType, ReactNode} from 'react';

import React from 'react';
import {StyleSheet, View} from 'react-native';

type ReactNativeActual = {
    View: ComponentType<{testID?: string; children?: ReactNode}>;
    Text: ComponentType<{children?: ReactNode}>;
};

const mockStyles = {
    dividerLine: {borderBottomWidth: 1},
    mv2: {marginVertical: 8},
};

const mockReceiptSection = jest.fn();

jest.mock('@hooks/useThemeStyles', () => ({
    __esModule: true,
    default: () => mockStyles,
}));

// The real section resolves thumbnails from Onyx. The layout only places it, so render a marker and record its props.
jest.mock('@components/MoneyRequestConfirmationListFooter/sections/ReceiptSection', () => {
    const {View: MockView} = jest.requireActual<ReactNativeActual>('react-native');
    return {
        __esModule: true,
        default: (props: unknown) => {
            mockReceiptSection(props);
            return <MockView testID="receipt-section" />;
        },
    };
});

// The real button needs icons, tooltips and navigation. Only whether the layout offers it matters here.
jest.mock('@components/MoneyRequestConfirmationList/sections/AddReceiptButton', () => {
    const {Text: MockText} = jest.requireActual<ReactNativeActual>('react-native');
    return {
        __esModule: true,
        default: () => <MockText>add-receipt-button</MockText>,
    };
});

const noReceiptOptions: ReceiptOptions = {shouldDisplayReceipt: false, receiptPath: undefined, receiptFilename: undefined};
const attachedReceiptOptions: ReceiptOptions = {shouldDisplayReceipt: true, receiptPath: 'file://receipt.jpg', receiptFilename: 'receipt.jpg'};

/** Stands in for the amount field, which renders the trailing action the layout provides beside it */
function AmountFieldStandIn() {
    const {amountTrailingAction, shouldUseDropdownRows} = useExpenseFormLayout();
    return (
        <>
            <Text>{`dropdown-rows:${String(shouldUseDropdownRows)}`}</Text>
            {amountTrailingAction}
        </>
    );
}

type RenderLayoutOptions = {
    receiptOptions?: ReceiptOptions;
    hasParticipantSection?: boolean;
    isReadOnly?: boolean;
    children?: ReactNode;
};

function renderLayout({receiptOptions = noReceiptOptions, hasParticipantSection = false, isReadOnly = false, children = <AmountFieldStandIn />}: RenderLayoutOptions = {}) {
    return render(
        <ConfirmationFieldsProvider
            transactionID="txn1"
            reportID="report1"
            action={CONST.IOU.ACTION.CREATE}
            iouType={CONST.IOU.TYPE.SUBMIT}
            isReadOnly={isReadOnly}
        >
            <ExpenseFormFooterLayout
                policy={undefined}
                receiptOptions={receiptOptions}
                hasParticipantSection={hasParticipantSection}
            >
                {children}
            </ExpenseFormFooterLayout>
        </ConfirmationFieldsProvider>,
    );
}

function getViewStyles() {
    return screen
        .UNSAFE_getAllByType(View)
        .map((view) => StyleSheet.flatten<unknown>(view.props.style))
        .filter(isRecord);
}

function getDividers() {
    return getViewStyles().filter((style) => style.borderBottomWidth === mockStyles.dividerLine.borderBottomWidth);
}

/** The wrapper around the receipt preview is the only view styled with just the vertical margin */
function getReceiptSpacers() {
    return getViewStyles().filter((style) => style.marginVertical === mockStyles.mv2.marginVertical && style.borderBottomWidth === undefined);
}

describe('ExpenseFormFooterLayout', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('shows the add-receipt button only when there is no receipt and the user can add one', () => {
        // Given an editable submit expense with no receipt attached yet
        // When the footer layout renders
        renderLayout();

        // Then the compact add-receipt button is offered next to the amount, inside the bordered dropdown-row form
        expect(screen.getByText('add-receipt-button')).toBeOnTheScreen();
        expect(screen.getByText('dropdown-rows:true')).toBeOnTheScreen();
    });

    it('hides the add-receipt button once a receipt is attached', () => {
        // Given the same form but with a receipt already attached
        // When the footer layout renders
        renderLayout({receiptOptions: attachedReceiptOptions});

        // Then the button is gone because the receipt preview replaces it
        expect(screen.queryByText('add-receipt-button')).not.toBeOnTheScreen();
    });

    it('hides the add-receipt button while a receipt is still loading', () => {
        // Given a receipt that is being stitched, so its path is not known yet
        // When the footer layout renders
        renderLayout({receiptOptions: {...noReceiptOptions, isLoadingReceipt: true}});

        // Then the button is hidden, because the loading preview already occupies the receipt area
        expect(screen.queryByText('add-receipt-button')).not.toBeOnTheScreen();
    });

    it('hides the add-receipt button when the form is read-only', () => {
        // Given a read-only confirmation with no receipt, where the user can't change anything
        // When the footer layout renders
        renderLayout({isReadOnly: true});

        // Then no add-receipt button is offered
        expect(screen.queryByText('add-receipt-button')).not.toBeOnTheScreen();
    });

    it('draws a divider only when a participant section sits above the footer', () => {
        // Given a footer rendered below a participant section
        // When the footer layout renders
        const {unmount} = renderLayout({hasParticipantSection: true});

        // Then a divider separates the participants from the expense fields
        expect(getDividers()).toHaveLength(1);
        unmount();

        // Given a footer with no participant section above it
        // When the footer layout renders
        renderLayout({hasParticipantSection: false});

        // Then there is nothing to separate, so no divider is drawn
        expect(getDividers()).toHaveLength(0);
    });

    it('spaces the receipt preview only when a receipt is shown', () => {
        // Given a footer with an attached receipt
        // When the footer layout renders
        const {unmount} = renderLayout({receiptOptions: attachedReceiptOptions});

        // Then the preview wrapper carries the 8px margin that keeps it clear of the divider and the first field
        expect(getReceiptSpacers()).toHaveLength(1);
        unmount();

        // Given a footer with no receipt
        // When the footer layout renders
        renderLayout();

        // Then the empty receipt area adds no spacing
        expect(getReceiptSpacers()).toHaveLength(0);
    });

    it('renders the receipt section without its full-width empty state and passes the receipt options through', () => {
        // Given a footer with an attached receipt
        // When the footer layout renders
        renderLayout({receiptOptions: attachedReceiptOptions});

        // Then the receipt section hides its full-width empty state, since the compact button offers that action instead
        expect(mockReceiptSection).toHaveBeenCalledWith(expect.objectContaining({...attachedReceiptOptions, shouldHideEmptyState: true}));
    });

    it('renders the variant content below the receipt preview', () => {
        // Given variant-specific content passed as children
        // When the footer layout renders
        renderLayout({children: <Text>variant-fields</Text>});

        // Then the content renders after the receipt section, so the receipt stays above the fields
        const json = JSON.stringify(screen.toJSON());
        expect(screen.getByText('variant-fields')).toBeOnTheScreen();
        expect(json.indexOf('receipt-section')).toBeLessThan(json.indexOf('variant-fields'));
    });
});
