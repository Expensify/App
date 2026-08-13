import {render, screen} from '@testing-library/react-native';

import OnyxListItemProvider from '@components/OnyxListItemProvider';

import {getDisplayNameForParticipant} from '@libs/ReportUtils';

import ReportTypingIndicator from '@pages/inbox/report/ReportTypingIndicator';

import ONYXKEYS from '@src/ONYXKEYS';

import React from 'react';
import Onyx from 'react-native-onyx';

import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

const mockTranslate = jest.fn((path: string) => path);
const mockFormatPhoneNumber = jest.fn((value: string) => value);

jest.mock('@hooks/useLocalize', () => () => ({translate: mockTranslate, formatPhoneNumber: mockFormatPhoneNumber}));

jest.mock('@libs/ReportUtils', () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const actual = jest.requireActual('@libs/ReportUtils');
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return {
        ...actual,
        __esModule: true,
        getDisplayNameForParticipant: jest.fn(() => 'SPY_NAME'),
    };
});

const mockGetDisplayNameForParticipant = jest.mocked(getDisplayNameForParticipant);

const REPORT_ID = '881001';
const TYPING_ACCOUNT_ID = 777001;

describe('ReportTypingIndicator', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
        return waitForBatchedUpdates();
    });

    beforeEach(() => {
        jest.clearAllMocks();
        return Onyx.clear().then(waitForBatchedUpdates);
    });

    it('resolves the typing user display name through the translate function from useLocalize', async () => {
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_USER_IS_TYPING}${REPORT_ID}`, {[TYPING_ACCOUNT_ID]: true});
        await waitForBatchedUpdates();

        render(
            <OnyxListItemProvider>
                <ReportTypingIndicator reportID={REPORT_ID} />
            </OnyxListItemProvider>,
        );
        await waitForBatchedUpdates();

        // The typing user's name resolves via getDisplayNameForParticipant, which must receive the translate from useLocalize.
        expect(mockGetDisplayNameForParticipant).toHaveBeenCalledWith(expect.objectContaining({accountID: TYPING_ACCOUNT_ID, shouldFallbackToHidden: false, translate: mockTranslate}));
        expect(screen.getByText('SPY_NAME')).toBeOnTheScreen();
    });
});
