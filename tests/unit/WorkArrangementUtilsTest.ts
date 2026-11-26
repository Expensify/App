import {generateAccountID} from '@libs/UserUtils';
import {getEffectiveWorkArrangement, getWorkArrangementLabel, isAccountIDGeneratedFromLogin} from '@libs/WorkArrangementUtils';

import CONST from '@src/CONST';

import {translateLocal} from '../utils/TestHelper';

describe('WorkArrangementUtils', () => {
    describe('getEffectiveWorkArrangement', () => {
        it.each([
            {memberArrangement: true, workspaceArrangement: false, fallbackArrangement: false, expected: true},
            {memberArrangement: false, workspaceArrangement: true, fallbackArrangement: false, expected: false},
            {memberArrangement: undefined, workspaceArrangement: true, fallbackArrangement: false, expected: true},
            {memberArrangement: undefined, workspaceArrangement: false, expected: false},
            {memberArrangement: undefined, workspaceArrangement: undefined, expected: true},
            {memberArrangement: undefined, workspaceArrangement: undefined, fallbackArrangement: false, expected: false},
        ] as const)('uses member arrangement when set, then workspace default, then fallback (%#)', ({memberArrangement, workspaceArrangement, fallbackArrangement, expected}) => {
            // Given a member arrangement and an optional workspace default,
            // When resolving the member's effective work arrangement,
            // Then explicit member and workspace values take precedence, with an office-based server default unless an explicit fallback is provided.
            expect(getEffectiveWorkArrangement(memberArrangement, workspaceArrangement, fallbackArrangement)).toBe(expected);
        });
    });

    describe('getWorkArrangementLabel', () => {
        it.each([
            {isOfficeBased: true, expectedTranslationKey: 'workspace.people.officeBased'},
            {isOfficeBased: false, expectedTranslationKey: 'workspace.people.noRegularWorkspace'},
        ] as const)('translates the work arrangement for the current locale (%#)', ({isOfficeBased, expectedTranslationKey}) => {
            // Given an office-based flag,
            // When requesting its label in the current locale,
            // Then the corresponding workspace people translation is used.
            expect(getWorkArrangementLabel(translateLocal, isOfficeBased)).toBe(translateLocal(expectedTranslationKey));
        });
    });

    describe('isAccountIDGeneratedFromLogin', () => {
        it('matches the accountID the app generates from an email', () => {
            // Given the accountID the app generates for an invited email
            const login = 'invitee@example.com';

            // When it is checked against that email
            // Then it matches, so callers know the server doesn't have it
            expect(isAccountIDGeneratedFromLogin(generateAccountID(login), login)).toBe(true);
        });

        it('matches the accountID generated from a phone number without its SMS domain', () => {
            // Given the accountID an invite generates from a bare phone number
            const phoneNumber = '+15005550006';

            // When it is checked against the phone login stored with its SMS domain
            // Then it still matches, because invites hash the number without the domain
            expect(isAccountIDGeneratedFromLogin(generateAccountID(phoneNumber), `${phoneNumber}${CONST.SMS.DOMAIN}`)).toBe(true);
        });

        it('does not match a real accountID', () => {
            // Given a real accountID the server assigned, which isn't the hash of the login
            const login = 'member@example.com';
            const realAccountID = generateAccountID(login) + 1;

            // When it is checked against that login
            // Then it doesn't match, so requests with it still go out
            expect(isAccountIDGeneratedFromLogin(realAccountID, login)).toBe(false);
        });
    });
});
