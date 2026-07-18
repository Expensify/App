import {render} from '@testing-library/react-native';

import OnyxListItemProvider from '@components/OnyxListItemProvider';

import {getDisplayNameForParticipant} from '@libs/ReportUtils';

import QuickActionMenuItem from '@pages/inbox/sidebar/FABPopoverContent/menuItems/QuickActionMenuItem';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import React from 'react';
import Onyx from 'react-native-onyx';

import {createRegularChat} from '../utils/collections/reports';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

const mockTranslate = jest.fn((path: string) => path);
const mockFormatPhoneNumber = jest.fn((value: string) => value);

jest.mock('@hooks/useLocalize', () => () => ({translate: mockTranslate, formatPhoneNumber: mockFormatPhoneNumber}));

jest.mock('@hooks/useLazyAsset', () => ({
    useMemoizedLazyExpensifyIcons: () => new Proxy({}, {get: (_, name) => String(name)}),
}));

jest.mock('@pages/inbox/sidebar/FABPopoverContent/FABFocusableMenuItem', () => jest.fn(() => null));

const AVATAR_ACCOUNT_ID = 555001;

jest.mock('@libs/ReportUtils', () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const actual = jest.requireActual('@libs/ReportUtils');
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return {
        ...actual,
        __esModule: true,
        getDisplayNameForParticipant: jest.fn(() => 'SPY_NAME'),
        getIcons: jest.fn(() => [{id: 555001, source: '', name: 'Avatar', type: 'avatar'}]),
    };
});

const mockGetDisplayNameForParticipant = jest.mocked(getDisplayNameForParticipant);

const QUICK_ACTION_REPORT_ID = '991001';

describe('QuickActionMenuItem', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
        return waitForBatchedUpdates();
    });

    it('resolves the pay-someone title name through the translate function from useLocalize', async () => {
        const report = {...createRegularChat(Number(QUICK_ACTION_REPORT_ID), [1, AVATAR_ACCOUNT_ID]), reportID: QUICK_ACTION_REPORT_ID};
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${QUICK_ACTION_REPORT_ID}`, report);
        await Onyx.merge(ONYXKEYS.NVP_QUICK_ACTION_GLOBAL_CREATE, {action: CONST.QUICK_ACTIONS.SEND_MONEY, chatReportID: QUICK_ACTION_REPORT_ID});
        await waitForBatchedUpdates();

        render(
            <OnyxListItemProvider>
                <QuickActionMenuItem reportID={QUICK_ACTION_REPORT_ID} />
            </OnyxListItemProvider>,
        );
        await waitForBatchedUpdates();

        // The pay-someone quick action resolves the payee name via getDisplayNameForParticipant, which must receive the translate from useLocalize.
        expect(mockGetDisplayNameForParticipant).toHaveBeenCalledWith(expect.objectContaining({accountID: AVATAR_ACCOUNT_ID, shouldUseShortForm: true, translate: mockTranslate}));
        expect(mockTranslate).toHaveBeenCalledWith('quickAction.paySomeone', 'SPY_NAME');
    });
});
