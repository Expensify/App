import {fireEvent, render, screen, waitFor} from '@testing-library/react-native';

import MoneyRequestReportTransactionsNavigation from '@components/MoneyRequestReportView/MoneyRequestReportTransactionsNavigation';

import * as ReportActions from '@libs/actions/Report';

import Navigation from '@navigation/Navigation';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {ReportActions as OnyxReportActions, Transaction} from '@src/types/onyx';

import React from 'react';
import Onyx from 'react-native-onyx';

import createRandomReportAction from '../utils/collections/reportActions';
import createRandomTransaction from '../utils/collections/transaction';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

jest.mock('@react-navigation/native', () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- jest.requireActual() returns the real module for partial mocking
    const actualNavigation = jest.requireActual('@react-navigation/native');
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return -- returning the real module plus one overridden hook is the standard Jest partial-mock pattern
    return {
        ...actualNavigation,
        useIsFocused: () => true,
    };
});

jest.mock('@components/WideRHPContextProvider', () => ({
    useWideRHPActions: () => ({markReportRHPWidth: jest.fn(), unmarkReportRHPWidth: jest.fn()}),
}));

jest.mock('@components/OnyxListItemProvider', () => ({
    usePersonalDetails: () => ({}),
}));

jest.mock('@hooks/useCurrentUserPersonalDetails', () => ({
    __esModule: true,
    default: () => ({email: 'a@b.com', accountID: 1}),
}));

const IOU_REPORT_ID = 'iou1';
const FIRST_TRANSACTION_ID = 't1';
const SECOND_TRANSACTION_ID = 't2';

function buildIOUActions(): OnyxReportActions {
    const action = {
        ...createRandomReportAction(2),
        reportActionID: 'action2',
        actionName: CONST.REPORT.ACTIONS.TYPE.IOU,
        childReportID: 'thread2',
        originalMessage: {IOUTransactionID: SECOND_TRANSACTION_ID, IOUReportID: IOU_REPORT_ID, type: CONST.IOU.REPORT_ACTION_TYPE.CREATE, amount: 100, currency: 'USD'},
    };
    return {action2: action};
}

function buildTransaction(transactionID: string, index: number): Transaction {
    return {...createRandomTransaction(index), transactionID, reportID: IOU_REPORT_ID};
}

describe('MoneyRequestReportTransactionsNavigation', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        jest.clearAllMocks();
        await Onyx.clear();
        // The report's own actions are deliberately absent: this is the cache-cleared shape, where the
        // seeded sibling IDs are known but the IOU actions that resolve them have not been fetched yet.
        await Onyx.set(ONYXKEYS.TRANSACTION_THREAD_NAVIGATION_TRANSACTION_IDS, [FIRST_TRANSACTION_ID, SECOND_TRANSACTION_ID]);
        await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION}${FIRST_TRANSACTION_ID}`, buildTransaction(FIRST_TRANSACTION_ID, 0));
        await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION}${SECOND_TRANSACTION_ID}`, buildTransaction(SECOND_TRANSACTION_ID, 1));
        await waitForBatchedUpdates();
    });

    it('does not mint a thread or navigate when next is pressed before the report actions load', async () => {
        const createThreadSpy = jest.spyOn(ReportActions, 'createTransactionThreadReport');
        const setParamsSpy = jest.spyOn(Navigation, 'setParams').mockImplementation(() => {});

        render(<MoneyRequestReportTransactionsNavigation currentTransactionID={FIRST_TRANSACTION_ID} />);
        await waitForBatchedUpdates();

        // Both arrows render with the generic button role; the second one is next.
        const buttons = screen.getAllByLabelText(CONST.ROLE.BUTTON);
        expect(buttons).toHaveLength(2);
        const nextButton = buttons.at(1);
        if (!nextButton) {
            throw new Error('next arrow did not render');
        }
        fireEvent.press(nextButton);

        await waitFor(() => {
            expect(createThreadSpy).not.toHaveBeenCalled();
        });
        expect(setParamsSpy).not.toHaveBeenCalled();
    });

    it('fetches the sibling parent report instead of dropping the press, then replays it when the action lands', async () => {
        const openReportSpy = jest.spyOn(ReportActions, 'openReport').mockImplementation(() => {});
        const setParamsSpy = jest.spyOn(Navigation, 'setParams').mockImplementation(() => {});

        render(<MoneyRequestReportTransactionsNavigation currentTransactionID={FIRST_TRANSACTION_ID} />);
        await waitForBatchedUpdates();

        const buttons = screen.getAllByLabelText(CONST.ROLE.BUTTON);
        const nextButton = buttons.at(1);
        if (!nextButton) {
            throw new Error('next arrow did not render');
        }
        fireEvent.press(nextButton);

        // The press is staged rather than dropped: the sibling's parent report is fetched.
        await waitFor(() => {
            expect(openReportSpy).toHaveBeenCalledWith(expect.objectContaining({reportID: IOU_REPORT_ID}));
        });
        expect(setParamsSpy).not.toHaveBeenCalled();
    });

    it('abandons a staged press when the user has navigated elsewhere', async () => {
        jest.spyOn(ReportActions, 'openReport').mockImplementation(() => {});
        const createThreadSpy = jest.spyOn(ReportActions, 'createTransactionThreadReport');
        const setParamsSpy = jest.spyOn(Navigation, 'setParams').mockImplementation(() => {});
        const getActiveRouteSpy = jest.spyOn(Navigation, 'getActiveRoute');
        getActiveRouteSpy.mockReturnValue(ROUTES.REPORT_WITH_ID.getRoute('origin'));

        render(<MoneyRequestReportTransactionsNavigation currentTransactionID={FIRST_TRANSACTION_ID} />);
        await waitForBatchedUpdates();

        const buttons = screen.getAllByLabelText(CONST.ROLE.BUTTON);
        const nextButton = buttons.at(1);
        if (!nextButton) {
            throw new Error('next arrow did not render');
        }
        fireEvent.press(nextButton);
        await waitForBatchedUpdates();

        // The user moved on before the fetch settled, so the staged press must not navigate.
        getActiveRouteSpy.mockReturnValue(ROUTES.REPORT_WITH_ID.getRoute('elsewhere'));
        await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${IOU_REPORT_ID}`, buildIOUActions());
        await waitForBatchedUpdates();

        expect(setParamsSpy).not.toHaveBeenCalled();
        expect(createThreadSpy).not.toHaveBeenCalled();
    });
});
