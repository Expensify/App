import {renderHook} from '@testing-library/react-native';

import OnyxListItemProvider from '@components/OnyxListItemProvider';
import useReportActionAvatars from '@components/ReportActionAvatars/useReportActionAvatars';

import {getDisplayNameForParticipant} from '@libs/ReportUtils';

import ONYXKEYS from '@src/ONYXKEYS';

import Onyx from 'react-native-onyx';

import createRandomReportAction from '../utils/collections/reportActions';
import {createRegularChat} from '../utils/collections/reports';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

const mockTranslate = jest.fn((path: string) => path);
const mockFormatPhoneNumber = jest.fn((value: string) => value);

jest.mock('@hooks/useLocalize', () => () => ({translate: mockTranslate, formatPhoneNumber: mockFormatPhoneNumber, localeCompare: (a: string, b: string) => a.localeCompare(b)}));

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

const ACTOR_ACCOUNT_ID = 636363;

const wrapper = ({children}: {children: React.ReactNode}) => {
    return <OnyxListItemProvider>{children}</OnyxListItemProvider>;
};

describe('useReportActionAvatars translate wiring', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
        return waitForBatchedUpdates();
    });

    it('threads the translate function from useLocalize into the default display name resolution', async () => {
        const report = createRegularChat(1, [ACTOR_ACCOUNT_ID]);
        const action = {...createRandomReportAction(2), actorAccountID: ACTOR_ACCOUNT_ID};
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${report.reportID}`, report);
        await waitForBatchedUpdates();

        renderHook(() => useReportActionAvatars({report, action}), {wrapper});

        // The hook resolves the default display name via getDisplayNameForParticipant, which must receive the translate from useLocalize.
        expect(mockGetDisplayNameForParticipant).toHaveBeenCalledWith(expect.objectContaining({accountID: ACTOR_ACCOUNT_ID, translate: mockTranslate}));
    });
});
