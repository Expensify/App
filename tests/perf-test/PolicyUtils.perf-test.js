import {measureFunction} from 'reassure';
import {getMemberAccountIDsForWorkspace} from "@libs/PolicyUtils";

describe('[PolicyUtils] Performance tests for getMemberAccountIDsForWorkspace', () => {

    test('With multiple members without errors and login details', async () => {
        const policyMembers = Object.fromEntries(Array.from({length: 10000}, (_, i) => [`${i}`, {errors: {}}]));
        const personalDetails = Object.fromEntries(Array.from({length: 10000}, (_, i) => [`${i}`, {
            accountID: 12345,
            firstName: 'First',
            lastName: 'Last',
            displayName: 'First Last',
            validated: true,
            phoneNumber: 1234567890,
            login: `user${i}@example.com`
        }]));

        await measureFunction(() => getMemberAccountIDsForWorkspace(
            policyMembers,
            personalDetails
        ));
    })

    test('With multiple members with errors and without login details', async () => {
        const policyMembers = Object.fromEntries(Array.from({length: 10000}, (_, i) => [`${i}`, {errors: {someError: true}}]));
        const personalDetails = Object.fromEntries(Array.from({length: 10000}, (_, i) => [`${i}`, {}]));

        await measureFunction(() => getMemberAccountIDsForWorkspace(
            policyMembers,
            personalDetails
        ));
    })

    test('With multiple members with errors and with login details', async () => {
        const policyMembers = Object.fromEntries(Array.from({length: 10000}, (_, i) => [`${i}`, {errors: {someError: true}}]));
        const personalDetails = Object.fromEntries(Array.from({length: 10000}, (_, i) => [`${i}`, {
            accountID: 12345,
            firstName: 'First',
            lastName: 'Last',
            displayName: 'First Last',
            validated: true,
            phoneNumber: 1234567890,
            login: `user${i}@example.com`
        }]));

        await measureFunction(() => getMemberAccountIDsForWorkspace(
            policyMembers,
            personalDetails
        ));
    })

    test('With multiple members without errors and without login details', async () => {
        const policyMembers = Object.fromEntries(Array.from({length: 10000}, (_, i) => [`${i}`, {errors: {}}]));
        const personalDetails = Object.fromEntries(Array.from({length: 10000}, (_, i) => [`${i}`, {}]));

        await measureFunction(() => getMemberAccountIDsForWorkspace(
            policyMembers,
            personalDetails
        ));
    })
});
