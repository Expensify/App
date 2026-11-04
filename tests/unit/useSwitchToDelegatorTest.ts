import {act, renderHook} from '@testing-library/react-native';

import {ModalActions} from '@components/Modal/Global/ModalContext';

import useSwitchToDelegator from '@hooks/useSwitchToDelegator';

import {connect, disconnect} from '@libs/actions/Delegate';
import {getGpsPoints, stopGpsTrip} from '@libs/GPSDraftDetailsUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type GpsDraftDetails from '@src/types/onyx/GpsDraftDetails';

import Onyx from 'react-native-onyx';

import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

const DELEGATOR_EMAIL = 'delegator@expensify.com';
const COPILOT_EMAIL = 'copilot@expensify.com';
const DELEGATED_ACCESS = {delegators: [{email: DELEGATOR_EMAIL, role: CONST.DELEGATE_ROLE.ALL}]};

const mockShowConfirmModal = jest.fn();
const mockTranslate = jest.fn((key: string) => key);
const mockShowDelegateNoAccessModal = jest.fn();

let mockIsOffline = false;
let mockIsActingAsDelegate = false;

jest.mock('@hooks/useLocalize', () => ({
    __esModule: true,
    default: () => ({translate: mockTranslate}),
}));

jest.mock('@hooks/useNetwork', () => ({
    __esModule: true,
    default: () => ({isOffline: mockIsOffline}),
}));

jest.mock('@hooks/useConfirmModal', () => ({
    __esModule: true,
    default: () => ({showConfirmModal: mockShowConfirmModal}),
}));

jest.mock('@components/DelegateNoAccessModalProvider', () => ({
    useDelegateNoAccessState: () => ({isActingAsDelegate: mockIsActingAsDelegate}),
    useDelegateNoAccessActions: () => ({showDelegateNoAccessModal: mockShowDelegateNoAccessModal}),
}));

jest.mock('@libs/actions/Delegate', () => ({
    connect: jest.fn(),
    disconnect: jest.fn(),
}));

const mockModalClose = jest.fn((onModalCloseCallback?: () => void) => onModalCloseCallback?.());

jest.mock('@libs/actions/Modal', () => ({
    close: (onModalCloseCallback?: () => void) => mockModalClose(onModalCloseCallback),
}));

jest.mock('@libs/GPSDraftDetailsUtils', () => ({
    getGpsPoints: jest.fn(() => [[{lat: 1, long: 2}]]),
    stopGpsTrip: jest.fn(() => Promise.resolve()),
}));

const mockConnect = jest.mocked(connect);
const mockDisconnect = jest.mocked(disconnect);
const mockStopGpsTrip = jest.mocked(stopGpsTrip);
const mockGetGpsPoints = jest.mocked(getGpsPoints);

const mockGpsDraftDetails: GpsDraftDetails = {
    gpsPoints: [[{lat: 1, long: 2}]],
    distanceInMeters: 0,
    isTracking: true,
    reportID: '1',
    unit: 'mi',
};

async function seedSwitchState({isTrackingGPS = false} = {}) {
    await Onyx.merge(ONYXKEYS.ACCOUNT, {delegatedAccess: DELEGATED_ACCESS});
    await Onyx.merge(ONYXKEYS.CREDENTIALS, {login: COPILOT_EMAIL});
    await Onyx.merge(ONYXKEYS.SESSION, {email: COPILOT_EMAIL, accountID: 2});
    await Onyx.merge(ONYXKEYS.STASHED_SESSION, {email: COPILOT_EMAIL, authToken: 'original-token'});
    await Onyx.merge(ONYXKEYS.STASHED_CREDENTIALS, {login: COPILOT_EMAIL});
    await Onyx.set(ONYXKEYS.NVP_ACTIVE_POLICY_ID, 'policy123');
    await Onyx.merge(ONYXKEYS.GPS_DRAFT_DETAILS, isTrackingGPS ? mockGpsDraftDetails : {isTracking: false, gpsPoints: [[{lat: 3, long: 4}]]});
    await waitForBatchedUpdates();
}

function setActingAsDelegate() {
    mockIsActingAsDelegate = true;
}

describe('useSwitchToDelegator', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        jest.clearAllMocks();
        mockIsOffline = false;
        mockIsActingAsDelegate = false;
        mockShowConfirmModal.mockResolvedValue({action: ModalActions.CONFIRM});
        await Onyx.clear();
        await seedSwitchState();
    });

    it('shows the offline modal and switches to nobody while offline', async () => {
        // Given the user is offline, where a switch would strand them without a usable session
        mockIsOffline = true;
        const {result} = renderHook(() => useSwitchToDelegator());

        // When they press "Switch to delegator"
        await act(async () => {
            await result.current(DELEGATOR_EMAIL);
        });

        // Then the offline modal appears and neither connect nor disconnect runs
        expect(mockShowConfirmModal).toHaveBeenCalledWith(expect.objectContaining({title: 'common.youAppearToBeOffline'}));
        expect(mockConnect).not.toHaveBeenCalled();
        expect(mockDisconnect).not.toHaveBeenCalled();
    });

    it('connects with the Onyx values the connect action needs', async () => {
        // Given an online copilot who is not acting as a delegate, with no GPS trip recording
        const {result} = renderHook(() => useSwitchToDelegator());

        // When they switch to a delegator
        await act(async () => {
            await result.current(DELEGATOR_EMAIL);
        });

        // Then connect gets the values read from Onyx, including the delegatedAccess the account selector used to project
        expect(mockConnect).toHaveBeenCalledWith({
            email: DELEGATOR_EMAIL,
            delegatedAccess: DELEGATED_ACCESS,
            credentials: {login: COPILOT_EMAIL},
            session: {email: COPILOT_EMAIL, accountID: 2},
            activePolicyID: 'policy123',
        });
        expect(mockDisconnect).not.toHaveBeenCalled();
        expect(mockStopGpsTrip).not.toHaveBeenCalled();
    });

    it('disconnects with the stashed session and credentials when returning to the original user', async () => {
        // Given the user already acts as a delegate
        setActingAsDelegate();
        const {result} = renderHook(() => useSwitchToDelegator());

        // When they switch back to the email stashed when the delegate session started
        await act(async () => {
            await result.current(COPILOT_EMAIL);
        });

        // Then disconnect runs with the stashed values instead of connect
        expect(mockDisconnect).toHaveBeenCalledWith({
            stashedCredentials: {login: COPILOT_EMAIL},
            stashedSession: {email: COPILOT_EMAIL, authToken: 'original-token'},
        });
        expect(mockConnect).not.toHaveBeenCalled();
    });

    it('falls back to an empty credentials object when nothing was stashed', async () => {
        // Given a returning delegate whose stashed credentials were cleared
        setActingAsDelegate();
        await Onyx.merge(ONYXKEYS.STASHED_CREDENTIALS, null);
        await waitForBatchedUpdates();
        const {result} = renderHook(() => useSwitchToDelegator());

        // When they switch back to the original user
        await act(async () => {
            await result.current(COPILOT_EMAIL);
        });

        // Then disconnect still gets an empty object rather than undefined, as the useOnyx default did
        expect(mockDisconnect).toHaveBeenCalledWith({stashedCredentials: CONST.EMPTY_OBJECT, stashedSession: {email: COPILOT_EMAIL, authToken: 'original-token'}});
    });

    it('shows the no-access modal for a chained delegation', async () => {
        // Given the user already acts as a delegate and picks someone other than the original user
        setActingAsDelegate();
        const {result} = renderHook(() => useSwitchToDelegator());

        // When they try to switch to a second delegator
        await act(async () => {
            await result.current(DELEGATOR_EMAIL);
        });

        // Then the "not so fast" modal shows and no switch is attempted
        expect(mockShowDelegateNoAccessModal).toHaveBeenCalledTimes(1);
        expect(mockConnect).not.toHaveBeenCalled();
        expect(mockDisconnect).not.toHaveBeenCalled();
    });

    it('stops the GPS trip and then connects when the trip warning is confirmed', async () => {
        // Given an active GPS trip is recording while the user switches
        await seedSwitchState({isTrackingGPS: true});
        const {result} = renderHook(() => useSwitchToDelegator());

        // When they confirm the trip-in-progress warning
        await act(async () => {
            await result.current(DELEGATOR_EMAIL);
        });

        // Then the trip is stopped before connecting, with the points of the draft read for the stop
        expect(mockShowConfirmModal).toHaveBeenCalledWith(expect.objectContaining({title: 'gps.switchAccountWarningTripInProgress.title'}));
        expect(mockGetGpsPoints).toHaveBeenCalledWith(expect.objectContaining({isTracking: true}));
        expect(mockStopGpsTrip).toHaveBeenCalledWith(false, [[{lat: 1, long: 2}]], true);
        expect(mockConnect).toHaveBeenCalledTimes(1);
    });

    it('keeps the trip running and does not switch when the trip warning is cancelled', async () => {
        // Given an active GPS trip and a user who backs out of the warning
        await seedSwitchState({isTrackingGPS: true});
        mockShowConfirmModal.mockResolvedValue({action: ModalActions.CLOSE});
        const {result} = renderHook(() => useSwitchToDelegator());

        // When the warning is dismissed instead of confirmed
        await act(async () => {
            await result.current(DELEGATOR_EMAIL);
        });

        // Then the trip keeps recording and no account switch happens
        expect(mockShowConfirmModal).toHaveBeenCalledTimes(1);
        expect(mockStopGpsTrip).not.toHaveBeenCalled();
        expect(mockConnect).not.toHaveBeenCalled();
    });

    it('closes the menu in the same tick as the press when a trip is recording', async () => {
        // Given an active GPS trip, so the switch has to wait for the menu it was pressed in to close
        await seedSwitchState({isTrackingGPS: true});
        const {result} = renderHook(() => useSwitchToDelegator());
        await waitForBatchedUpdates();

        // When the user presses "Switch", without letting any promise settle
        act(() => {
            result.current(DELEGATOR_EMAIL);
        });

        // Then modalClose already ran, while the menu is still registered, so the trip warning waits for it to close instead of opening over it
        expect(mockModalClose).toHaveBeenCalledTimes(1);
        await act(async () => {
            await waitForBatchedUpdates();
        });
    });

    it('switches without waiting for the menu to finish closing when no warning is needed', async () => {
        // Given the menu the switch was pressed in is still animating out
        mockModalClose.mockImplementationOnce(() => {});
        const {result} = renderHook(() => useSwitchToDelegator());

        // When the user presses "Switch" with no trip recording
        await act(async () => {
            await result.current(DELEGATOR_EMAIL);
        });

        // Then the switch starts right away, as it did before the reads moved into the handler
        expect(mockConnect).toHaveBeenCalledTimes(1);
    });

    it('waits for the menu to finish closing before showing the trip warning', async () => {
        // Given a recording trip and a menu that is still animating out, where opening another modal freezes iOS
        await seedSwitchState({isTrackingGPS: true});
        let closeMenu: (() => void) | undefined;
        mockModalClose.mockImplementationOnce((onModalCloseCallback) => {
            closeMenu = onModalCloseCallback;
        });
        const {result} = renderHook(() => useSwitchToDelegator());

        // When the user presses "Switch"
        await act(async () => {
            result.current(DELEGATOR_EMAIL);
        });

        // Then the trip warning stays closed while the menu is still closing
        expect(mockShowConfirmModal).not.toHaveBeenCalled();

        // When the menu reports it has closed
        await act(async () => {
            closeMenu?.();
            await waitForBatchedUpdates();
        });

        // Then the trip warning opens
        expect(mockShowConfirmModal).toHaveBeenCalledTimes(1);
    });

    it('waits for the menu to finish closing before showing the no-access modal', async () => {
        // Given the user already acts as a delegate and the menu is still animating out, where opening another modal freezes iOS
        setActingAsDelegate();
        let closeMenu: (() => void) | undefined;
        mockModalClose.mockImplementationOnce((onModalCloseCallback) => {
            closeMenu = onModalCloseCallback;
        });
        const {result} = renderHook(() => useSwitchToDelegator());

        // When they press "Switch" on a second delegator
        await act(async () => {
            result.current(DELEGATOR_EMAIL);
        });

        // Then the "not so fast" modal stays closed while the menu is still closing
        expect(mockShowDelegateNoAccessModal).not.toHaveBeenCalled();

        // When the menu reports it has closed
        await act(async () => {
            closeMenu?.();
            await waitForBatchedUpdates();
        });

        // Then the "not so fast" modal opens
        expect(mockShowDelegateNoAccessModal).toHaveBeenCalledTimes(1);
    });

    it('stops the trip with the latest draft after the warning is confirmed', async () => {
        // Given the trip captures another segment after the press, while the warning is open
        await seedSwitchState({isTrackingGPS: true});
        mockShowConfirmModal.mockImplementation(async () => {
            await Onyx.merge(ONYXKEYS.GPS_DRAFT_DETAILS, {gpsPoints: [[{lat: 1, long: 2}], [{lat: 5, long: 6}]]});
            return {action: ModalActions.CONFIRM};
        });
        const {result} = renderHook(() => useSwitchToDelegator());

        // When the user confirms the warning
        await act(async () => {
            await result.current(DELEGATOR_EMAIL);
        });

        // Then the stop uses the draft read after the confirmation, so the points recorded while the warning was open are kept
        expect(mockGetGpsPoints).toHaveBeenCalledWith(expect.objectContaining({gpsPoints: [[{lat: 1, long: 2}], [{lat: 5, long: 6}]]}));
    });
});
