import * as ErrorUtils from '../../src/libs/ErrorUtils';

describe('ErrorUtils', () => {
    test('adds a new error message for a given inputID', () => {
        const errors = {};
        ErrorUtils.addErrorMessage(errors, 'username', 'Username cannot be empty');

        expect(errors).toEqual({username: 'Username cannot be empty'});
    });

    test('appends an error message to an existing error message for a given inputID', () => {
        const errors = {username: 'Username cannot be empty'};
        ErrorUtils.addErrorMessage(errors, 'username', 'Username must be at least 6 characters long');

        expect(errors).toEqual({username: 'Username cannot be empty\nUsername must be at least 6 characters long'});
    });

    test('returns the errors object unchanged when inputID is not found', () => {
        const errors = {username: 'Username cannot be empty'};
        ErrorUtils.addErrorMessage(errors, 'password', 'Password cannot be empty');

        expect(errors).toEqual({username: 'Username cannot be empty', password: 'Password cannot be empty'});
    });

    test('returns the errors object unchanged when message is empty', () => {
        const errors = {username: 'Username cannot be empty'};
        ErrorUtils.addErrorMessage(errors, 'username', '');

        expect(errors).toEqual({username: 'Username cannot be empty'});
    });

    test('returns the errors object unchanged when inputID is null', () => {
        const errors = {username: 'Username cannot be empty'};
        ErrorUtils.addErrorMessage(errors, null, 'InputID cannot be null');

        expect(errors).toEqual({username: 'Username cannot be empty'});
    });

    test('returns the errors object unchanged when message is null', () => {
        const errors = {username: 'Username cannot be empty'};
        ErrorUtils.addErrorMessage(errors, 'username', null);

        expect(errors).toEqual({username: 'Username cannot be empty'});
    });
});
