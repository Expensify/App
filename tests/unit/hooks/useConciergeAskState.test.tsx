import {renderHook} from '@testing-library/react-native';

import OnyxListItemProvider from '@components/OnyxListItemProvider';

import useConciergeAskState from '@hooks/useConciergeAskState';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import Onyx from 'react-native-onyx';

import waitForBatchedUpdates from '../../utils/waitForBatchedUpdates';

const wrapper = ({children}: {children: React.ReactNode}) => <OnyxListItemProvider>{children}</OnyxListItemProvider>;

const CONCIERGE_REPORT_ID = '1';
const SESSION_START = '2024-06-01 12:00:00.000';

jest.mock('@hooks/useCurrentUserPersonalDetails', () => ({
    __esModule: true,
    default: jest.fn(() => ({accountID: 100})),
}));

jest.mock('@pages/inbox/ConciergeSessionContext', () => ({
    useConciergeSessionState: () => ({sessionStartTime: SESSION_START, showFullHistory: false, hadMessagesAtSessionStart: false}),
}));

describe('useConciergeAskState', () => {
    beforeAll(async () => {
        Onyx.init({keys: ONYXKEYS});
        await Onyx.set(ONYXKEYS.CONCIERGE_REPORT_ID, CONCIERGE_REPORT_ID);
        await Onyx.set(ONYXKEYS.BETAS, [CONST.BETAS.CONCIERGE_RESPOND_IN_THREAD]);
        await waitForBatchedUpdates();
    });

    it('shows the empty state when the session has no activity', () => {
        const {result} = renderHook(() => useConciergeAskState(CONCIERGE_REPORT_ID), {wrapper});

        expect(result.current.isAskConciergeChat).toBe(true);
        expect(result.current.isHistoryExpanded).toBe(false);
        expect(result.current.shouldShowWelcome).toBe(true);
    });

    it('stays off outside the Concierge report', () => {
        const {result} = renderHook(() => useConciergeAskState('999'), {wrapper});

        expect(result.current.isAskConciergeChat).toBe(false);
        expect(result.current.shouldShowWelcome).toBe(false);
    });

    it('stays off when the Ask Concierge beta is disabled', async () => {
        await Onyx.set(ONYXKEYS.BETAS, []);
        await waitForBatchedUpdates();

        const {result} = renderHook(() => useConciergeAskState(CONCIERGE_REPORT_ID), {wrapper});
        expect(result.current.isAskConciergeChat).toBe(false);

        await Onyx.set(ONYXKEYS.BETAS, [CONST.BETAS.CONCIERGE_RESPOND_IN_THREAD]);
        await waitForBatchedUpdates();
    });
});
