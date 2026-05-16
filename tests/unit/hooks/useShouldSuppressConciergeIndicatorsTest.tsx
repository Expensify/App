import {renderHook} from '@testing-library/react-native';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useIsInSidePanel from '@hooks/useIsInSidePanel';
import useOnyx from '@hooks/useOnyx';
import useShouldSuppressConciergeIndicators from '@hooks/useShouldSuppressConciergeIndicators';
import useSidePanelState from '@hooks/useSidePanelState';
import ONYXKEYS from '@src/ONYXKEYS';

const CONCIERGE_REPORT_ID = '12345';
const CURRENT_USER_ACCOUNT_ID = 999;

const mockUseOnyx = useOnyx as jest.Mock;
jest.mock('@hooks/useOnyx', () => jest.fn(() => [undefined, {status: 'loaded'}]));

const mockUseIsInSidePanel = useIsInSidePanel as jest.Mock;
jest.mock('@hooks/useIsInSidePanel', () => jest.fn(() => false));

const mockUseSidePanelState = useSidePanelState as jest.Mock;
jest.mock('@hooks/useSidePanelState', () => jest.fn(() => ({sessionStartTime: null})));

const mockUseCurrentUserPersonalDetails = useCurrentUserPersonalDetails as jest.Mock;
jest.mock('@hooks/useCurrentUserPersonalDetails', () => jest.fn(() => ({accountID: CURRENT_USER_ACCOUNT_ID})));

describe('useShouldSuppressConciergeIndicators', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockUseIsInSidePanel.mockReturnValue(false);
        mockUseSidePanelState.mockReturnValue({sessionStartTime: null});
        mockUseCurrentUserPersonalDetails.mockReturnValue({accountID: CURRENT_USER_ACCOUNT_ID});
        mockUseOnyx.mockImplementation((key: string) => {
            if (key === ONYXKEYS.CONCIERGE_REPORT_ID) {
                return [CONCIERGE_REPORT_ID, {status: 'loaded'}];
            }
            return [undefined, {status: 'loaded'}];
        });
    });

    it('should return false for non-concierge report', () => {
        mockUseIsInSidePanel.mockReturnValue(true);
        mockUseSidePanelState.mockReturnValue({sessionStartTime: '2024-01-01 00:00:00.000'});
        const {result} = renderHook(() => useShouldSuppressConciergeIndicators('other-report-id'));
        expect(result.current).toBe(false);
    });

    it('should return false when not in side panel', () => {
        mockUseIsInSidePanel.mockReturnValue(false);
        mockUseOnyx.mockImplementation((key: string) => {
            if (key === ONYXKEYS.CONCIERGE_REPORT_ID) {
                return [CONCIERGE_REPORT_ID, {status: 'loaded'}];
            }
            if (key === `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${CONCIERGE_REPORT_ID}`) {
                return [true, {status: 'loaded'}];
            }
            return [undefined, {status: 'loaded'}];
        });

        const {result} = renderHook(() => useShouldSuppressConciergeIndicators(CONCIERGE_REPORT_ID));
        expect(result.current).toBe(false);
    });

    it('should suppress indicators in side panel when no user messages and no unread', () => {
        mockUseIsInSidePanel.mockReturnValue(true);
        mockUseSidePanelState.mockReturnValue({sessionStartTime: '2024-01-01 00:00:00.000'});
        mockUseOnyx.mockImplementation((key: string) => {
            if (key === ONYXKEYS.CONCIERGE_REPORT_ID) {
                return [CONCIERGE_REPORT_ID, {status: 'loaded'}];
            }
            if (key === `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${CONCIERGE_REPORT_ID}`) {
                return [true, {status: 'loaded'}];
            }
            return [undefined, {status: 'loaded'}];
        });

        const {result} = renderHook(() => useShouldSuppressConciergeIndicators(CONCIERGE_REPORT_ID));
        expect(result.current).toBe(true);
    });

    it('should not suppress when selector indicates user sent message or unread exist', () => {
        mockUseIsInSidePanel.mockReturnValue(true);
        mockUseSidePanelState.mockReturnValue({sessionStartTime: '2024-01-01 00:00:00.000'});
        mockUseOnyx.mockImplementation((key: string) => {
            if (key === ONYXKEYS.CONCIERGE_REPORT_ID) {
                return [CONCIERGE_REPORT_ID, {status: 'loaded'}];
            }
            if (key === `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${CONCIERGE_REPORT_ID}`) {
                return [false, {status: 'loaded'}];
            }
            return [undefined, {status: 'loaded'}];
        });

        const {result} = renderHook(() => useShouldSuppressConciergeIndicators(CONCIERGE_REPORT_ID));
        expect(result.current).toBe(false);
    });

    it('should not suppress when session start time is null', () => {
        mockUseIsInSidePanel.mockReturnValue(true);
        mockUseSidePanelState.mockReturnValue({sessionStartTime: null});
        mockUseOnyx.mockImplementation((key: string) => {
            if (key === ONYXKEYS.CONCIERGE_REPORT_ID) {
                return [CONCIERGE_REPORT_ID, {status: 'loaded'}];
            }
            if (key === `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${CONCIERGE_REPORT_ID}`) {
                return [false, {status: 'loaded'}];
            }
            return [undefined, {status: 'loaded'}];
        });

        const {result} = renderHook(() => useShouldSuppressConciergeIndicators(CONCIERGE_REPORT_ID));
        expect(result.current).toBe(false);
    });
});
