import {getAllowedRolesForMember, isPolicyReimburser} from '@libs/PolicyMemberRoleUtils';
import {PAYER_ROLES} from '@libs/PolicyUtils';

import CONST from '@src/CONST';
import type {Policy} from '@src/types/onyx';

import createMock from '../utils/createMock';

describe('PolicyMemberRoleUtils', () => {
    describe('isPolicyReimburser', () => {
        it('should return true when the member is the Authorized Payer', () => {
            // Given a workspace whose Authorized Payer is a specific member
            const policy = createMock<Policy>({
                id: '1',
                reimbursementChoice: CONST.POLICY.REIMBURSEMENT_CHOICES.REIMBURSEMENT_YES,
                reimburser: 'payer@example.com',
            });

            // When that member is checked
            const isReimburser = isPolicyReimburser(policy, 'payer@example.com');

            // Then they are the payer, so a role change must stay inside the payer roles
            expect(isReimburser).toBe(true);
        });

        it('should return false when the member is not the Authorized Payer', () => {
            // Given a workspace whose Authorized Payer is someone else
            const policy = createMock<Policy>({
                id: '1',
                reimbursementChoice: CONST.POLICY.REIMBURSEMENT_CHOICES.REIMBURSEMENT_YES,
                reimburser: 'payer@example.com',
            });

            // When a different member is checked
            const isReimburser = isPolicyReimburser(policy, 'other@example.com');

            // Then they are not the payer, so their role is not restricted to payer roles
            expect(isReimburser).toBe(false);
        });

        it('should return false when reimbursement is disabled', () => {
            // Given a workspace with reimbursement turned off, even if a reimburser email is stored
            const policy = createMock<Policy>({
                id: '1',
                reimbursementChoice: CONST.POLICY.REIMBURSEMENT_CHOICES.REIMBURSEMENT_NO,
                reimburser: 'payer@example.com',
            });

            // When that stored payer is checked
            const isReimburser = isPolicyReimburser(policy, 'payer@example.com');

            // Then nobody is the Authorized Payer, so the role restriction does not apply
            expect(isReimburser).toBe(false);
        });
    });

    describe('getAllowedRolesForMember', () => {
        it('should restrict the Authorized Payer to payer roles', () => {
            // Given a workspace whose Authorized Payer is a specific member
            const policy = createMock<Policy>({
                id: '1',
                reimbursementChoice: CONST.POLICY.REIMBURSEMENT_CHOICES.REIMBURSEMENT_YES,
                reimburser: 'payer@example.com',
            });

            // When the roles that member may be assigned are resolved
            const allowedRoles = getAllowedRolesForMember(policy, 'payer@example.com');

            // Then only roles that can pay are offered, matching the RHP role page
            expect(allowedRoles).toEqual([...PAYER_ROLES]);
        });

        it('should not restrict roles for a member who is not the Authorized Payer', () => {
            // Given a workspace whose Authorized Payer is someone else
            const policy = createMock<Policy>({
                id: '1',
                reimbursementChoice: CONST.POLICY.REIMBURSEMENT_CHOICES.REIMBURSEMENT_YES,
                reimburser: 'payer@example.com',
            });

            // When the roles for a different member are resolved
            const allowedRoles = getAllowedRolesForMember(policy, 'other@example.com');

            // Then no restriction is returned, so the full assignable role list is used
            expect(allowedRoles).toBeUndefined();
        });
    });
});
