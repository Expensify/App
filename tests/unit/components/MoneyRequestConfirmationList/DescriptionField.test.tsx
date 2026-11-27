import {fireEvent, render, screen, waitFor} from '@testing-library/react-native';

import HTMLEngineProvider from '@components/HTMLEngineProvider';
import ConfirmationFieldsProvider from '@components/MoneyRequestConfirmationFields/Provider';
import DescriptionField from '@components/MoneyRequestConfirmationList/sections/DescriptionField';
import ExpenseFormLayoutContext, {dropdownRowsExpenseFormLayout} from '@components/MoneyRequestConfirmationList/sections/ExpenseFormLayoutContext';
import type {BaseTextInputRef} from '@components/TextInput/BaseTextInput/types';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import React from 'react';
import Onyx from 'react-native-onyx';

import waitForBatchedUpdates from '../../../utils/waitForBatchedUpdates';

jest.mock('@hooks/useLocalize', () => () => ({translate: (key: string) => key}));

const TRANSACTION_ID = '1';
const REPORT_ID = 'reportID';

const MULTI_LINE_MARKDOWN_DESCRIPTION = '*Team lunch*\n_Client visit_\nParking\nTaxi home';

const renderReadOnlyDescription = () =>
    render(
        <HTMLEngineProvider>
            <ConfirmationFieldsProvider
                transactionID={TRANSACTION_ID}
                reportID={REPORT_ID}
                action={CONST.IOU.ACTION.CREATE}
                iouType={CONST.IOU.TYPE.SUBMIT}
                isReadOnly
            >
                <ExpenseFormLayoutContext.Provider value={dropdownRowsExpenseFormLayout}>
                    <DescriptionField
                        isDescriptionRequired={false}
                        policy={undefined}
                    />
                </ExpenseFormLayoutContext.Provider>
            </ConfirmationFieldsProvider>
        </HTMLEngineProvider>,
    );

describe('DescriptionField', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        await Onyx.clear();
        await waitForBatchedUpdates();
    });

    it('renders a locked multi-line markdown description as formatted text, without clamping its lines', async () => {
        // Given an expense whose description spans several lines and uses markdown
        await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${TRANSACTION_ID}`, {
            transactionID: TRANSACTION_ID,
            reportID: REPORT_ID,
            comment: {comment: MULTI_LINE_MARKDOWN_DESCRIPTION},
        });
        await waitForBatchedUpdates();

        // When the bordered form renders the description as a locked row, which is the path that regressed in #101301
        renderReadOnlyDescription();

        // Then every line is shown, so the row does not cut the description down to its first lines
        await waitFor(() => {
            expect(screen.getAllByText(/Team lunch/).length).toBeGreaterThan(0);
        });
        expect(screen.getAllByText(/Client visit/).length).toBeGreaterThan(0);
        expect(screen.getAllByText(/Parking/).length).toBeGreaterThan(0);
        expect(screen.getAllByText(/Taxi home/).length).toBeGreaterThan(0);

        // And no line limit is set on the text, since Jest renders clamped text in full and would not catch it otherwise
        for (const lastLine of screen.getAllByText(/Taxi home/)) {
            expect(lastLine.props.numberOfLines).toBeUndefined();
        }

        // And the markdown is rendered rather than shown as raw markup
        expect(screen.queryAllByText(/[*_]/)).toHaveLength(0);
    });

    it('keeps the description input from taking focus while the discard prompt shows, so iOS cannot raise its keyboard over the prompt', () => {
        // Given the editable description input of a new expense, while the discard prompt covers the form
        render(
            <HTMLEngineProvider>
                <ConfirmationFieldsProvider
                    transactionID={TRANSACTION_ID}
                    reportID={REPORT_ID}
                    action={CONST.IOU.ACTION.CREATE}
                    iouType={CONST.IOU.TYPE.SUBMIT}
                    isDiscardModalVisible
                >
                    <DescriptionField
                        isDescriptionRequired={false}
                        policy={undefined}
                    />
                </ConfirmationFieldsProvider>
            </HTMLEngineProvider>,
        );

        // When the input renders
        const descriptionInput = screen.getByLabelText('common.description');

        // Then it is read-only, so the refocus iOS does after a cancelled back swipe cannot bring the keyboard back
        expect(descriptionInput).toHaveProp('readOnly', true);
    });

    it('reports the description input when it takes focus, so cancelling the discard prompt can focus it again', () => {
        // Given the editable description input of a new expense
        const onInlineInputFocus = jest.fn<void, [() => BaseTextInputRef | null]>();
        render(
            <HTMLEngineProvider>
                <ConfirmationFieldsProvider
                    transactionID={TRANSACTION_ID}
                    reportID={REPORT_ID}
                    action={CONST.IOU.ACTION.CREATE}
                    iouType={CONST.IOU.TYPE.SUBMIT}
                    onInlineInputFocus={onInlineInputFocus}
                >
                    <DescriptionField
                        isDescriptionRequired={false}
                        policy={undefined}
                    />
                </ConfirmationFieldsProvider>
            </HTMLEngineProvider>,
        );

        // When the user focuses it
        fireEvent(screen.getByLabelText('common.description'), 'focus');

        // Then the form learns which input to focus after Cancel
        expect(onInlineInputFocus).toHaveBeenCalledTimes(1);
        expect(onInlineInputFocus.mock.calls.at(0)?.at(0)?.()).toBeTruthy();
    });
});
