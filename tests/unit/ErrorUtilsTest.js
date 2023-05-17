import * as ErrorUtils from '../../src/libs/ErrorUtils';

describe('ErrorUtils', () => {
    test('should add a new error message for a given inputID', () => {
        const errors = {};
        ErrorUtils.addErrorMessage(errors, 'username', 'Username cannot be empty');

        expect(errors).toEqual({username: 'Username cannot be empty'});
    });

    test('should append an error message to an existing error message for a given inputID', () => {
        const errors = {username: 'Username cannot be empty'};
        ErrorUtils.addErrorMessage(errors, 'username', 'Username must be at least 6 characters long');

        expect(errors).toEqual({username: 'Username cannot be empty\nUsername must be at least 6 characters long'});
    });

    test('should add an error to input which does not contain any errors yet', () => {
        const errors = {username: 'Username cannot be empty'};
        ErrorUtils.addErrorMessage(errors, 'password', 'Password cannot be empty');

        expect(errors).toEqual({username: 'Username cannot be empty', password: 'Password cannot be empty'});
    });

    test('should not mutate the errors object when message is empty', () => {
        const errors = {username: 'Username cannot be empty'};
        ErrorUtils.addErrorMessage(errors, 'username', '');

        expect(errors).toEqual({username: 'Username cannot be empty'});
    });

    test('should not mutate the errors object when inputID is null', () => {
        const errors = {username: 'Username cannot be empty'};
        ErrorUtils.addErrorMessage(errors, null, 'InputID cannot be null');

        expect(errors).toEqual({username: 'Username cannot be empty'});
    });

    test('should not mutate the errors object when message is null', () => {
        const errors = {username: 'Username cannot be empty'};
        ErrorUtils.addErrorMessage(errors, 'username', null);

        expect(errors).toEqual({username: 'Username cannot be empty'});
    });

    test('should add multiple error messages for the same inputID', () => {
        const errors = {};
        ErrorUtils.addErrorMessage(errors, 'username', 'Username cannot be empty');
        ErrorUtils.addErrorMessage(errors, 'username', 'Username must be at least 6 characters long');
        ErrorUtils.addErrorMessage(errors, 'username', 'Username must contain at least one letter');

        expect(errors).toEqual({username: 'Username cannot be empty\nUsername must be at least 6 characters long\nUsername must contain at least one letter'});
    });

    test('should append multiple error messages to an existing error message for the same inputID', () => {
        const errors = {username: 'Username cannot be empty\nUsername must be at least 6 characters long'};
        ErrorUtils.addErrorMessage(errors, 'username', 'Username must contain at least one letter');
        ErrorUtils.addErrorMessage(errors, 'username', 'Username must not contain special characters');

        expect(errors).toEqual({
            username: 'Username cannot be empty\nUsername must be at least 6 characters long\nUsername must contain at least one letter\nUsername must not contain special characters',
        });
    });
});
