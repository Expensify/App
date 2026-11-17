/** Tests cancellation and single-use continuation independently of profile updates. */
import Navigation, {navigationRef} from '@libs/Navigation/Navigation';
import {beginWalletEnrollment, cancelWalletEnrollment, completeWalletEnrollment, isWalletEnrollmentActive} from '@libs/WalletEnrollment';

import type {NavigationState} from '@react-navigation/native';

import createMock from '../utils/createMock';

jest.mock('@libs/Navigation/Navigation', () => ({
    __esModule: true,
    default: {closeRHPFlow: jest.fn(), runAfterUpcomingTransition: jest.fn()},
    navigationRef: {addListener: jest.fn(), getRootState: jest.fn()},
}));

describe('Wallet personal-details enrollment', () => {
    const unsubscribe = jest.fn();
    let onStateChange: () => void;
    let afterTransition: () => void;
    let enrollmentID: string;

    function showRoute(id?: string, key = 'verify') {
        jest.spyOn(navigationRef, 'getRootState').mockReturnValue(
            createMock<NavigationState>({routes: [{key: 'root', name: 'root', state: {routes: [{key, name: 'details', params: {walletEnrollmentID: id}}]}}]}),
        );
        onStateChange();
    }

    beforeEach(() => {
        jest.clearAllMocks();
        jest.spyOn(navigationRef, 'addListener').mockImplementation((_event, callback) => {
            onStateChange = () => callback({type: 'state', data: {state: undefined}});
            return unsubscribe;
        });
        jest.mocked(Navigation.runAfterUpcomingTransition).mockImplementation((callback) => {
            afterTransition = callback;
            return {cancel: jest.fn()};
        });
    });

    afterEach(() => cancelWalletEnrollment(enrollmentID));

    it('resumes the matching card exactly once after dismissal settles', () => {
        // Given an open collection flow with a matching card.
        const resume = jest.fn();
        enrollmentID = beginWalletEnrollment('123', resume);
        showRoute(enrollmentID);

        // When a different card tries to finish, then the matching save finishes twice.
        expect(completeWalletEnrollment(enrollmentID, '456', 'verify')).toBe(false);
        expect(completeWalletEnrollment(enrollmentID, '123', 'verify')).toBe(true);
        expect(completeWalletEnrollment(enrollmentID, '123', 'verify')).toBe(false);

        // Then only the matching completion closes collection and runs once after the transition.
        expect(Navigation.closeRHPFlow).toHaveBeenCalledTimes(1);
        expect(resume).not.toHaveBeenCalled();
        afterTransition();
        afterTransition();
        expect(resume).toHaveBeenCalledTimes(1);
        expect(unsubscribe).toHaveBeenCalled();
    });

    it('keeps internal replacements but cancels when the collection route disappears', () => {
        // Given an open collection flow.
        const resume = jest.fn();
        enrollmentID = beginWalletEnrollment('123', resume);
        showRoute(enrollmentID);

        // When editing or verification replaces its route, then the user dismisses it.
        showRoute(enrollmentID);
        expect(isWalletEnrollmentActive(enrollmentID, '123')).toBe(true);
        showRoute();

        // Then a late successful response cannot reopen wallet setup.
        expect(completeWalletEnrollment(enrollmentID, '123', 'verify')).toBe(false);
        expect(Navigation.closeRHPFlow).not.toHaveBeenCalled();
        expect(resume).not.toHaveBeenCalled();
    });

    it('ignores superseded attempts and owner teardown during dismissal', () => {
        // Given one attempt replaced by another for the same card.
        const oldResume = jest.fn();
        const resume = jest.fn();
        const oldID = beginWalletEnrollment('123', oldResume);
        enrollmentID = beginWalletEnrollment('123', resume);
        showRoute(enrollmentID);

        // When an old cleanup runs, followed by successful save and owner teardown.
        cancelWalletEnrollment(oldID);
        expect(completeWalletEnrollment(oldID, '123', 'verify')).toBe(false);
        expect(completeWalletEnrollment(enrollmentID, '123', 'verify')).toBe(true);
        cancelWalletEnrollment(enrollmentID);
        afterTransition();

        // Then neither callback can authorize enrollment.
        expect(oldResume).not.toHaveBeenCalled();
        expect(resume).not.toHaveBeenCalled();
    });

    it('rejects a save from verification that was replaced while editing', () => {
        // Given a submitted verification screen.
        const resume = jest.fn();
        enrollmentID = beginWalletEnrollment('123', resume);
        showRoute(enrollmentID, 'old-verification');

        // When the user goes back to edit and then opens a new verification screen.
        showRoute(enrollmentID, 'editing');
        expect(completeWalletEnrollment(enrollmentID, '123', 'old-verification')).toBe(false);
        showRoute(enrollmentID, 'new-verification');

        // Then the old response cannot consume the attempt, but the new screen can complete it.
        expect(completeWalletEnrollment(enrollmentID, '123', 'old-verification')).toBe(false);
        expect(resume).not.toHaveBeenCalled();
        expect(completeWalletEnrollment(enrollmentID, '123', 'new-verification')).toBe(true);
        afterTransition();
        expect(resume).toHaveBeenCalledTimes(1);
    });
});
