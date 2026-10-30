import {render, waitFor} from '@testing-library/react-native';

import ConfirmationFieldsProvider from '@components/MoneyRequestConfirmationFields/Provider';
import AttendeeField from '@components/MoneyRequestConfirmationList/sections/AttendeeField';
import type ExpenseFieldDropdown from '@components/MoneyRequestConfirmationList/sections/ExpenseFieldDropdown';
import ExpenseFormLayoutContext, {dropdownRowsExpenseFormLayout} from '@components/MoneyRequestConfirmationList/sections/ExpenseFormLayoutContext';
import OnyxListItemProvider from '@components/OnyxListItemProvider';

import CONST from '@src/CONST';
import type {IOUAction} from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import type {ComponentProps} from 'react';

import React from 'react';
import Onyx from 'react-native-onyx';

import waitForBatchedUpdates from '../../../utils/waitForBatchedUpdates';

jest.mock('@hooks/useLocalize', () => () => ({translate: (key: string) => key, localeCompare: (a: string, b: string) => a.localeCompare(b), formatPhoneNumber: (value: string) => value}));
jest.mock('@libs/Navigation/Navigation', () => ({navigate: jest.fn()}));

let mockIsAnchoredDropdownsBetaEnabled = true;
jest.mock('@hooks/usePermissions', () => () => ({
    isBetaEnabled: (beta: string) => mockIsAnchoredDropdownsBetaEnabled && beta === jest.requireActual<{default: typeof CONST}>('@src/CONST').default.BETAS.ANCHORED_FIELD_DROPDOWNS,
}));

// Records what the row decided and renders its list straight away, so each test can read both without pressing anything.
let mockShouldOpenInDropdown: boolean | undefined;
type ExpenseFieldDropdownMockProps = Pick<ComponentProps<typeof ExpenseFieldDropdown>, 'shouldOpenInDropdown' | 'renderDropdown'>;
jest.mock('@components/MoneyRequestConfirmationList/sections/ExpenseFieldDropdown', () => {
    return ({shouldOpenInDropdown, renderDropdown}: ExpenseFieldDropdownMockProps) => {
        const {MODAL} = jest.requireActual<{default: typeof CONST}>('@src/CONST').default;
        mockShouldOpenInDropdown = shouldOpenInDropdown;
        return renderDropdown({
            isVisible: true,
            onClose: () => {},
            anchorPosition: {horizontal: 0, vertical: 0},
            anchorAlignment: {horizontal: MODAL.ANCHOR_ORIGIN_HORIZONTAL.LEFT, vertical: MODAL.ANCHOR_ORIGIN_VERTICAL.TOP},
            shouldMeasureAnchorPositionFromTop: true,
            shouldSwitchPositionIfOverflow: false,
            popoverWidth: 300,
            popoverHeight: 300,
        });
    };
});

let mockDropdownTransactionID: string | undefined;
jest.mock('@components/MoneyRequestConfirmationList/sections/AttendeeFieldDropdown', () => ({transactionID}: {transactionID: string}) => {
    mockDropdownTransactionID = transactionID;
    return null;
});

const TRANSACTION_ID = '1';
const REPORT_ID = 'report1';

type RenderParams = {
    action?: IOUAction;
    isReadOnly?: boolean;
    transactionID?: string;
    didConfirm?: boolean;
};

const renderAttendeesRow = ({action = CONST.IOU.ACTION.CREATE, isReadOnly = false, transactionID = TRANSACTION_ID, didConfirm = false}: RenderParams = {}) =>
    render(
        <OnyxListItemProvider>
            <ConfirmationFieldsProvider
                transactionID={transactionID}
                reportID={REPORT_ID}
                action={action}
                iouType={CONST.IOU.TYPE.SUBMIT}
                didConfirm={didConfirm}
            >
                <ExpenseFormLayoutContext.Provider value={dropdownRowsExpenseFormLayout}>
                    <AttendeeField
                        formattedAmountPerAttendee="$10.00"
                        isReadOnly={isReadOnly}
                        transactionID={transactionID}
                        action={action}
                        iouType={CONST.IOU.TYPE.SUBMIT}
                        reportID={REPORT_ID}
                        formError=""
                    />
                </ExpenseFormLayoutContext.Provider>
            </ConfirmationFieldsProvider>
        </OnyxListItemProvider>,
    );

describe('AttendeeField', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        mockIsAnchoredDropdownsBetaEnabled = true;
        mockShouldOpenInDropdown = undefined;
        mockDropdownTransactionID = undefined;
        await Onyx.clear();
        await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${TRANSACTION_ID}`, {transactionID: TRANSACTION_ID, reportID: REPORT_ID});
        await waitForBatchedUpdates();
    });

    it('opens the attendee list in place while creating an expense', async () => {
        // Given a draft expense on the create form, with the anchored dropdowns beta on
        // When the form renders the attendees row
        renderAttendeesRow();

        // Then the row opens its list in a container anchored to it, for this expense, rather than pushing the full-page selector
        await waitFor(() => {
            expect(mockShouldOpenInDropdown).toBe(true);
        });
        expect(mockDropdownTransactionID).toBe(TRANSACTION_ID);
    });

    it('keeps the full-page selector when the beta is off', async () => {
        // Given the same draft, for a user without the anchored dropdowns beta
        mockIsAnchoredDropdownsBetaEnabled = false;

        // When the form renders the attendees row
        renderAttendeesRow();

        // Then the row opens the full-page selector as before
        await waitFor(() => {
            expect(mockShouldOpenInDropdown).toBe(false);
        });
    });

    it('keeps the full-page selector for a saved expense being edited', async () => {
        // Given a saved expense whose attendees are being edited, which the dropdown cannot save since it writes to the draft
        // When the form renders the attendees row
        renderAttendeesRow({action: CONST.IOU.ACTION.EDIT});

        // Then the row opens the full page, which saves through the API
        await waitFor(() => {
            expect(mockShouldOpenInDropdown).toBe(false);
        });
    });

    it('does not open the list for a read-only row', async () => {
        // Given a form whose attendees cannot be changed
        // When the form renders the attendees row
        renderAttendeesRow({isReadOnly: true});

        // Then the row opens nothing, in place or otherwise
        await waitFor(() => {
            expect(mockShouldOpenInDropdown).toBe(false);
        });
    });

    it('does not open the list in place once the expense is submitted', async () => {
        // Given a form whose Submit button has been pressed, so its draft is being submitted and cleared
        // When the form renders the attendees row
        renderAttendeesRow({didConfirm: true});

        // Then the row no longer opens the list in place, which would write to that draft on Apply
        await waitFor(() => {
            expect(mockShouldOpenInDropdown).toBe(false);
        });
    });
});
