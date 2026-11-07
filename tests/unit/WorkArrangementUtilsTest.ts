import {generateAccountID} from '@libs/UserUtils';
import {getEffectiveWorkArrangement, getMemberLoginByAccountID, getWorkArrangementLabel} from '@libs/WorkArrangementUtils';

import CONST from '@src/CONST';
import type {Policy} from '@src/types/onyx';

import createMock from '../utils/createMock';
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

    describe('getMemberLoginByAccountID', () => {
        const primaryLogin = 'primary@example.com';
        const secondaryLogin = 'secondary@example.com';
        const optimisticAccountID = generateAccountID(secondaryLogin);

        it('resolves an invited secondary login to the primary login the member is listed under', () => {
            // Given a member invited with a secondary login whose entry was left empty once the backend listed them under their primary login
            const policy = createMock<Policy>({
                primaryLoginsInvited: {[secondaryLogin]: primaryLogin},
                employeeList: {[secondaryLogin]: {}, [primaryLogin]: {email: primaryLogin, role: CONST.POLICY.ROLE.USER}},
            });

            // When resolving the member from the optimistic accountID of the secondary login
            // Then the primary login is returned, because the empty secondary entry is no longer the member
            expect(getMemberLoginByAccountID(policy, optimisticAccountID)).toBe(primaryLogin);
        });

        it('keeps the secondary login while the primary login is not listed yet', () => {
            // Given the secondary to primary mapping arrived before the primary login was added to the employee list
            const policy = createMock<Policy>({
                primaryLoginsInvited: {[secondaryLogin]: primaryLogin},
                employeeList: {[secondaryLogin]: {email: secondaryLogin, role: CONST.POLICY.ROLE.USER}},
            });

            // When resolving the member from the optimistic accountID of the secondary login
            // Then the secondary login is returned, because it is still the only entry for the member
            expect(getMemberLoginByAccountID(policy, optimisticAccountID)).toBe(secondaryLogin);
        });

        it('returns an empty login when the only matching entry was left empty', () => {
            // Given the secondary login entry was left empty and there is no mapping to the primary login
            const policy = createMock<Policy>({employeeList: {[secondaryLogin]: {}}});

            // When resolving the member from the optimistic accountID of the secondary login
            // Then no login is returned, because the empty entry is not a member
            expect(getMemberLoginByAccountID(policy, optimisticAccountID)).toBe('');
        });
    });
});
