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
        // This is the 305 policy diff warning: Auth ships an errors payload with a prompt that is not a failure,
        // and it lands while the optimistic pendingAction is still set.
        expect(getVacationDelegateErrors({errors: ERRORS, pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE})).toBeUndefined();
    });

    it('hides errors while a delete is still in flight', () => {
        expect(getVacationDelegateErrors({errors: ERRORS, pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE})).toBeUndefined();
    });

    it('surfaces errors once the change has settled, which is how every real failure is written', () => {
        expect(getVacationDelegateErrors({errors: ERRORS, pendingAction: null})).toEqual(ERRORS);
        expect(getVacationDelegateErrors({errors: ERRORS})).toEqual(ERRORS);
    });

    it('returns nothing when there is no error to show', () => {
        expect(getVacationDelegateErrors({delegate: 'delegate@test.com'})).toBeUndefined();
        expect(getVacationDelegateErrors(undefined)).toBeUndefined();
    });
});
