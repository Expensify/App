import {render} from '@testing-library/react-native';

import OnyxListItemProvider from '@components/OnyxListItemProvider';

import {getDisplayNameForParticipant} from '@libs/ReportUtils';

import ShareCodePage from '@pages/ShareCodePage';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Report} from '@src/types/onyx';

import React from 'react';
import Onyx from 'react-native-onyx';

import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

const mockTranslate = jest.fn((path: string) => path);
const mockFormatPhoneNumber = jest.fn((value: string) => value);

jest.mock('@hooks/useLocalize', () => () => ({translate: mockTranslate, formatPhoneNumber: mockFormatPhoneNumber}));

jest.mock('@hooks/useLazyAsset', () => ({
    useMemoizedLazyExpensifyIcons: () => new Proxy({}, {get: (_, name) => String(name)}),
}));

jest.mock('@components/ScreenWrapper', () => jest.fn(({children}: {children: React.ReactNode}) => children));
jest.mock('@components/HeaderWithBackButton', () => jest.fn(() => null));
jest.mock('@components/QRShare/QRShareWithDownload', () => jest.fn(() => null));
jest.mock('@components/ContextMenuItem', () => jest.fn(() => null));
jest.mock('@components/MenuItem', () => jest.fn(() => null));

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

const PARTICIPANT_A = 717001;
const PARTICIPANT_B = 717002;

describe('ShareCodePage', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
        return waitForBatchedUpdates();
    });

    it('resolves money request participant names through the translate function from useLocalize', async () => {
        // A money request (IOU) report renders its subtitle from participant display names.
        const iouReport: Report = {
            reportID: '717100',
            type: CONST.REPORT.TYPE.IOU,
            ownerAccountID: PARTICIPANT_A,
            managerID: PARTICIPANT_B,
            participants: {
                [PARTICIPANT_A]: {notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS},
                [PARTICIPANT_B]: {notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS},
            },
        };
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${iouReport.reportID}`, iouReport);
        await waitForBatchedUpdates();

        render(
            <OnyxListItemProvider>
                <ShareCodePage report={iouReport} />
            </OnyxListItemProvider>,
        );
        await waitForBatchedUpdates();

        // Each participant's name resolves via getDisplayNameForParticipant, which must receive the translate from useLocalize.
        expect(mockGetDisplayNameForParticipant).toHaveBeenCalledWith(expect.objectContaining({translate: mockTranslate}));
    });
});
