/**
 * These tests verify that a vacation delegate error only counts once the change it belongs to has settled, so the
 * errors payload Auth attaches to a 305 policy diff warning never reaches the profile page's red brick road.
 */
import getVacationDelegateErrors from '@libs/getVacationDelegateErrors';

import CONST from '@src/CONST';

// an ID map key is not a name!
// eslint-disable-next-line @typescript-eslint/naming-convention
const ERRORS = {1788970253939928: "Vacation delegate is not part of all of vacationer's policies."};

describe('getVacationDelegateErrors', () => {
    it('hides errors that arrive while the change is still in flight', () => {
        // Given the 305 policy diff warning, which ships an errors payload as a confirmation prompt rather than a
        // failure, landing while the optimistic pendingAction from an update is still set
        // When getVacationDelegateErrors evaluates that vacation delegate
        // Then no error is surfaced, since surfacing it here would flash a red brick road for a prompt, not a failure
        expect(getVacationDelegateErrors({errors: ERRORS, pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE})).toBeUndefined();
    });

    it('hides errors while a delete is still in flight', () => {
        // Given the same 305 payload landing during a delete's optimistic pendingAction instead of an update's
        // When getVacationDelegateErrors evaluates that vacation delegate
        // Then no error is surfaced, because the gate has to cover every pendingAction, not just update
        expect(getVacationDelegateErrors({errors: ERRORS, pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE})).toBeUndefined();
    });

    it('surfaces errors once the change has settled, which is how every real failure is written', () => {
        // Given the errors a real failure leaves behind, with pendingAction cleared (explicitly null, or simply
        // absent) the same way every genuine failing write clears it alongside the errors it attaches
        // When getVacationDelegateErrors evaluates that vacation delegate
        // Then the errors are surfaced, since nothing is left in flight to gate them
        expect(getVacationDelegateErrors({errors: ERRORS, pendingAction: null})).toEqual(ERRORS);
        expect(getVacationDelegateErrors({errors: ERRORS})).toEqual(ERRORS);
    });

    it('returns nothing when there is no error to show', () => {
        // Given a vacation delegate with no errors field at all, or no vacation delegate NVP at all
        // When getVacationDelegateErrors evaluates either one
        // Then it returns undefined instead of throwing, since both are the normal, error-free state
        expect(getVacationDelegateErrors({delegate: 'delegate@test.com'})).toBeUndefined();
        expect(getVacationDelegateErrors(undefined)).toBeUndefined();
    });
});
