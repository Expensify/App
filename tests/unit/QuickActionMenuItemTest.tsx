import {render} from '@testing-library/react-native';

import OnyxListItemProvider from '@components/OnyxListItemProvider';

import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';

import {getDisplayNameForParticipant} from '@libs/ReportUtils';

import FABFocusableMenuItem from '@pages/inbox/sidebar/FABPopoverContent/FABFocusableMenuItem';
import QuickActionMenuItem from '@pages/inbox/sidebar/FABPopoverContent/menuItems/QuickActionMenuItem';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import type {ValueOf} from 'type-fest';

import React from 'react';
import Onyx from 'react-native-onyx';

import createRandomPolicy from '../utils/collections/policies';
import {createPolicyExpenseChat, createRegularChat} from '../utils/collections/reports';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

const mockTranslate = jest.fn((path: string) => path);
const mockFormatPhoneNumber = jest.fn((value: string) => value);

jest.mock('@hooks/useLocalize', () => () => ({translate: mockTranslate, formatPhoneNumber: mockFormatPhoneNumber}));
jest.mock('@hooks/useCurrentUserPersonalDetails');

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
const mockUseCurrentUserPersonalDetails = jest.mocked(useCurrentUserPersonalDetails);
const mockFABFocusableMenuItem = jest.mocked(FABFocusableMenuItem);

const QUICK_ACTION_REPORT_ID = '991001';
const ACTIVE_POLICY_ID = '1234';
const POLICY_CHAT_REPORT_ID = '1235';

describe('QuickActionMenuItem', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
        return waitForBatchedUpdates();
    });

    beforeEach(() => {
        mockUseCurrentUserPersonalDetails.mockReturnValue({accountID: 1});
        mockFABFocusableMenuItem.mockClear();
        mockTranslate.mockClear();
        mockFormatPhoneNumber.mockClear();
        mockGetDisplayNameForParticipant.mockClear();
    });

    const renderWithActivePolicy = async (policyType: ValueOf<typeof CONST.POLICY.TYPE>) => {
        const activePolicy = createRandomPolicy(Number(ACTIVE_POLICY_ID), policyType);

        const policyExpenseChat = {
            ...createPolicyExpenseChat(Number(POLICY_CHAT_REPORT_ID)),
            reportID: POLICY_CHAT_REPORT_ID,
            policyID: ACTIVE_POLICY_ID,
            ownerAccountID: 1,
        };

        await Onyx.merge(ONYXKEYS.NVP_ACTIVE_POLICY_ID, ACTIVE_POLICY_ID);
        await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${ACTIVE_POLICY_ID}`, activePolicy);
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${POLICY_CHAT_REPORT_ID}`, policyExpenseChat);
        await Onyx.merge(ONYXKEYS.NVP_QUICK_ACTION_GLOBAL_CREATE, null);
        await waitForBatchedUpdates();

        render(
            <OnyxListItemProvider>
                <QuickActionMenuItem reportID={QUICK_ACTION_REPORT_ID} />
            </OnyxListItemProvider>,
        );
        await waitForBatchedUpdates();

        return mockFABFocusableMenuItem.mock.calls.at(-1)?.[0];
    };

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

    it('shows the workspace fallback quick action for a group policy', async () => {
        const props = await renderWithActivePolicy(CONST.POLICY.TYPE.TEAM);

        expect(mockFABFocusableMenuItem).toHaveBeenCalled();
        expect(props).toEqual(expect.objectContaining({isVisible: true}));
    });

    it('hides the workspace fallback quick action for a personal policy', async () => {
        const props = await renderWithActivePolicy(CONST.POLICY.TYPE.PERSONAL);

        expect(mockFABFocusableMenuItem).toHaveBeenCalled();
        expect(props).toEqual(expect.objectContaining({isVisible: false}));
    });
});
