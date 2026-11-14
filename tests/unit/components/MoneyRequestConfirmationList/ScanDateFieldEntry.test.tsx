import {act, fireEvent, render, screen} from '@testing-library/react-native';

import ComposeProviders from '@components/ComposeProviders';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import ConfirmationFieldsProvider from '@components/MoneyRequestConfirmationFields/Provider';
import DateField from '@components/MoneyRequestConfirmationList/sections/DateField';
import ExpenseFormLayoutContext, {dropdownRowsExpenseFormLayout} from '@components/MoneyRequestConfirmationList/sections/ExpenseFormLayoutContext';
import OnyxListItemProvider from '@components/OnyxListItemProvider';

import useResponsiveLayout from '@hooks/useResponsiveLayout';

import type * as DeviceCapabilities from '@libs/DeviceCapabilities';

import CONST from '@src/CONST';
import IntlStore from '@src/languages/IntlStore';
import ONYXKEYS from '@src/ONYXKEYS';

import React from 'react';
import Onyx from 'react-native-onyx';

import waitForBatchedUpdates from '../../../utils/waitForBatchedUpdates';

jest.mock('@libs/Navigation/Navigation', () => ({navigate: jest.fn()}));

// Typing is only offered where the calendar can sit beside the field, so a touch screen turns the whole feature off
jest.mock('@libs/DeviceCapabilities', () => ({
    ...jest.requireActual<typeof DeviceCapabilities>('@libs/DeviceCapabilities'),
    canUseTouchScreen: () => false,
}));

// The window's own width is what decides whether there is room to show a calendar beside the field
jest.mock('@hooks/useResponsiveLayout', () => jest.fn());

// The field reads the navigator to decide when autofocus is still wanted, and the test renders it on its own
jest.mock('@hooks/useAutoFocusInput', () => jest.fn(() => ({inputCallbackRef: jest.fn(), cancelAutoFocus: jest.fn()})));

const TRANSACTION_ID = '1';
const CHAT_REPORT_ID = 'chat1';
const POLICY_ID = 'policy1';

const YEAR_LABEL = 'Year';
const DAY_LABEL = 'Day';
const AUTOMATIC_HINT = 'Automatic';

function renderDateField() {
    render(
        <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider]}>
            <ConfirmationFieldsProvider
                transactionID={TRANSACTION_ID}
                reportID={CHAT_REPORT_ID}
                action={CONST.IOU.ACTION.CREATE}
                iouType={CONST.IOU.TYPE.SUBMIT}
                isPolicyExpenseChat
                canEnterScanFieldsManually
            >
                <ExpenseFormLayoutContext.Provider value={dropdownRowsExpenseFormLayout}>
                    <DateField
                        shouldDisplayFieldError={false}
                        didConfirm={false}
                        isReadOnly={false}
                        formError=""
                        transactionID={TRANSACTION_ID}
                        action={CONST.IOU.ACTION.CREATE}
                        iouType={CONST.IOU.TYPE.SUBMIT}
                        reportID={CHAT_REPORT_ID}
                        reportActionID={undefined}
                    />
                </ExpenseFormLayoutContext.Provider>
            </ConfirmationFieldsProvider>
        </ComposeProviders>,
    );
}

function typeYear(digits: string[]) {
    fireEvent(screen.getByLabelText(YEAR_LABEL), 'focus', {nativeEvent: {}});

    for (const key of digits) {
        fireEvent(screen.getByLabelText(YEAR_LABEL), 'keyPress', {preventDefault: jest.fn(), nativeEvent: {key}});
    }
}

// Tabbing out of the last segment is what tells the field the keyboard has carried focus away, which closes the
// calendar the first digit opened. The blur that follows is focus landing outside every segment.
function leaveFieldByTabbing() {
    fireEvent(screen.getByLabelText(DAY_LABEL), 'keyPress', {preventDefault: jest.fn(), nativeEvent: {key: CONST.KEYBOARD_SHORTCUTS.TAB.shortcutKey}});
    fireEvent(screen.getByLabelText(YEAR_LABEL), 'blur', {nativeEvent: {relatedTarget: undefined}});
}

describe('Scan date field', () => {
    // The segments and the hint are found by the strings the locale gives them
    beforeAll(async () => {
        Onyx.init({keys: ONYXKEYS});
        await act(async () => {
            await IntlStore.load(CONST.LOCALES.EN);
        });
    });

    beforeEach(async () => {
        jest.mocked(useResponsiveLayout).mockReturnValue({
            isSmallScreenWidth: false,
            shouldUseNarrowLayout: false,
            isInNarrowPaneModal: false,
            isExtraSmallScreenHeight: false,
            isMediumScreenWidth: false,
            isLargeScreenWidth: true,
            isExtraSmallScreenWidth: false,
            isSmallScreen: false,
            onboardingIsMediumOrLargerScreenWidth: true,
            isExtraLargeScreenWidth: false,
            isInLandscapeMode: false,
        });

        // A scanned receipt whose date SmartScan has not filled in yet, which is what the hint promises to do
        await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${TRANSACTION_ID}`, {
            transactionID: TRANSACTION_ID,
            reportID: '',
            iouRequestType: CONST.IOU.REQUEST_TYPE.SCAN,
            receipt: {source: 'receipt.jpg'},
            isCreatedSet: false,
            participants: [{policyID: POLICY_ID, reportID: CHAT_REPORT_ID, isPolicyExpenseChat: true, selected: true}],
        });
        await waitForBatchedUpdates();
    });

    it('promises to fill the date in while the field is untouched', async () => {
        // Given a scanned receipt whose date has not come back yet
        // When the form renders the date field
        renderDateField();
        await waitForBatchedUpdates();

        // Then the field says SmartScan is the one filling it in
        expect(screen.getByText(AUTOMATIC_HINT)).toBeOnTheScreen();
    });

    it('drops the promise once digits that are not yet a date have been left in the field', async () => {
        // Given the same field
        renderDateField();
        await waitForBatchedUpdates();

        // When a year is started but never finished, and the keyboard carries focus away
        typeYear(['2', '0', '2']);
        leaveFieldByTabbing();
        await waitForBatchedUpdates();

        // Then those digits are the user's, so the field stops promising to fill itself in over them
        expect(screen.getByLabelText(YEAR_LABEL).props.value).toBe('202');
        expect(screen.queryByText(AUTOMATIC_HINT)).toBeNull();
    });
});
