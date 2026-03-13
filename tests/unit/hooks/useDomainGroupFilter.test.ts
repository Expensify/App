/* eslint-disable @typescript-eslint/naming-convention */
import {act, renderHook, waitFor} from '@testing-library/react-native';
import Onyx from 'react-native-onyx';
import useDomainGroupFilter from '@hooks/useDomainGroupFilter';
import type {MemberOption} from '@pages/domain/BaseDomainMembersPage';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type Domain from '@src/types/onyx/Domain';
import waitForBatchedUpdates from '../../utils/waitForBatchedUpdates';

const DOMAIN_ACCOUNT_ID = 99999;
const SECURITY_GROUP_PREFIX = CONST.DOMAIN.DOMAIN_SECURITY_GROUP_PREFIX;

function buildDomain(groups: Record<string, {members: Record<string, 'read' | null>; name: string}>): Domain {
    const domain: Record<string, unknown> = {
        validated: true,
        accountID: DOMAIN_ACCOUNT_ID,
        email: 'admin@test.com',
        domain_defaultSecurityGroupID: Object.keys(groups).at(0) ?? '',
    };

    for (const [groupID, group] of Object.entries(groups)) {
        domain[`${SECURITY_GROUP_PREFIX}${groupID}`] = {
            shared: group.members,
            name: group.name,
            enableRestrictedPrimaryLogin: false,
            enableRestrictedPolicyCreation: false,
        };
    }

    return domain as unknown as Domain;
}

function buildMemberOption(accountID: number): MemberOption {
    return {
        accountID,
        login: `user${accountID}@test.com`,
        keyForList: String(accountID),
        text: `User ${accountID}`,
    };
}

describe('useDomainGroupFilter', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        await Onyx.clear();
        await waitForBatchedUpdates();
    });

    afterEach(async () => {
        await Onyx.clear();
    });

    describe('initial state', () => {
        it('should return null selectedGroup initially', () => {
            const {result} = renderHook(() => useDomainGroupFilter(DOMAIN_ACCOUNT_ID));
            expect(result.current.selectedGroup).toBeNull();
        });

        it('should return "All Members" as the dropdown label initially', () => {
            const {result} = renderHook(() => useDomainGroupFilter(DOMAIN_ACCOUNT_ID));
            expect(result.current.dropdownLabel).toBe(result.current.allMembersLabel);
        });

        it('should include "All Members" as the first group option', () => {
            const {result} = renderHook(() => useDomainGroupFilter(DOMAIN_ACCOUNT_ID));
            expect(result.current.groupOptions.at(0)?.value).toBe('all');
        });
    });

    describe('groupOptions', () => {
        it('should contain only "All Members" when no groups exist in Onyx', () => {
            const {result} = renderHook(() => useDomainGroupFilter(DOMAIN_ACCOUNT_ID));

            expect(result.current.groupOptions).toHaveLength(1);
            expect(result.current.groupOptions?.at(0)?.value).toBe('all');
        });

        it('should list all security groups from the domain after the "All Members" entry', async () => {
            const domain = buildDomain({
                '1': {members: {'100': 'read', '200': 'read'}, name: 'Engineering'},
                '2': {members: {'300': 'read'}, name: 'Marketing'},
            });
            await Onyx.merge(`${ONYXKEYS.COLLECTION.DOMAIN}${DOMAIN_ACCOUNT_ID}`, domain);

            const {result} = renderHook(() => useDomainGroupFilter(DOMAIN_ACCOUNT_ID));

            await waitFor(() => {
                expect(result.current.groupOptions).toHaveLength(3);
            });

            expect(result.current.groupOptions.at(0)?.value).toBe('all');
            expect(result.current.groupOptions.at(1)).toEqual({text: 'Engineering', value: '1'});
            expect(result.current.groupOptions.at(2)).toEqual({text: 'Marketing', value: '2'});
        });
    });

    describe('groupPreFilter', () => {
        it('should allow all members through when no group is selected', () => {
            const {result} = renderHook(() => useDomainGroupFilter(DOMAIN_ACCOUNT_ID));

            expect(result.current.groupPreFilter(buildMemberOption(100))).toBe(true);
            expect(result.current.groupPreFilter(buildMemberOption(999))).toBe(true);
        });

        it('should filter members to the selected group', async () => {
            const domain = buildDomain({
                '1': {members: {'100': 'read', '200': 'read'}, name: 'Engineering'},
                '2': {members: {'300': 'read'}, name: 'Marketing'},
            });
            await Onyx.merge(`${ONYXKEYS.COLLECTION.DOMAIN}${DOMAIN_ACCOUNT_ID}`, domain);

            const {result} = renderHook(() => useDomainGroupFilter(DOMAIN_ACCOUNT_ID));

            await waitFor(() => {
                expect(result.current.groupOptions).toHaveLength(3);
            });

            act(() => {
                result.current.handleGroupChange({text: 'Engineering', value: '1'});
            });

            expect(result.current.groupPreFilter(buildMemberOption(100))).toBe(true);
            expect(result.current.groupPreFilter(buildMemberOption(200))).toBe(true);
            expect(result.current.groupPreFilter(buildMemberOption(300))).toBe(false);
        });

        it('should allow all members again after switching back to "All Members"', async () => {
            const domain = buildDomain({
                '1': {members: {'100': 'read'}, name: 'Group 1'},
                '2': {members: {'200': 'read'}, name: 'Group 2'},
            });
            await Onyx.merge(`${ONYXKEYS.COLLECTION.DOMAIN}${DOMAIN_ACCOUNT_ID}`, domain);

            const {result} = renderHook(() => useDomainGroupFilter(DOMAIN_ACCOUNT_ID));

            await waitFor(() => {
                expect(result.current.groupOptions).toHaveLength(3);
            });

            act(() => {
                result.current.handleGroupChange({text: 'Group 1', value: '1'});
            });
            expect(result.current.groupPreFilter(buildMemberOption(200))).toBe(false);

            act(() => {
                result.current.handleGroupChange({text: 'All Members', value: 'all'});
            });
            expect(result.current.groupPreFilter(buildMemberOption(200))).toBe(true);
        });

        it('should allow all members and reset selection when group is not found', async () => {
            const domain = buildDomain({
                '1': {members: {'100': 'read'}, name: 'Group 1'},
            });
            await Onyx.merge(`${ONYXKEYS.COLLECTION.DOMAIN}${DOMAIN_ACCOUNT_ID}`, domain);

            const {result} = renderHook(() => useDomainGroupFilter(DOMAIN_ACCOUNT_ID));

            await waitFor(() => {
                expect(result.current.groupOptions).toHaveLength(2);
            });

            act(() => {
                result.current.handleGroupChange({text: 'Nonexistent', value: 'doesNotExist'});
            });

            expect(result.current.groupPreFilter(buildMemberOption(100))).toBe(true);
            expect(result.current.groupPreFilter(buildMemberOption(999))).toBe(true);
            expect(result.current.selectedGroup).toBeNull();
            expect(result.current.dropdownLabel).toBe(result.current.allMembersLabel);
        });
    });

    describe('handleGroupChange', () => {
        it('should set selectedGroup when a specific group is chosen', async () => {
            const domain = buildDomain({
                '1': {members: {'100': 'read'}, name: 'Engineering'},
            });
            await Onyx.merge(`${ONYXKEYS.COLLECTION.DOMAIN}${DOMAIN_ACCOUNT_ID}`, domain);

            const {result} = renderHook(() => useDomainGroupFilter(DOMAIN_ACCOUNT_ID));

            await waitFor(() => {
                expect(result.current.groupOptions).toHaveLength(2);
            });

            act(() => {
                result.current.handleGroupChange({text: 'Engineering', value: '1'});
            });

            expect(result.current.selectedGroup).toEqual({text: 'Engineering', value: '1'});
        });

        it('should clear selectedGroup when "All Members" is chosen', async () => {
            const domain = buildDomain({
                '1': {members: {'100': 'read'}, name: 'Engineering'},
            });
            await Onyx.merge(`${ONYXKEYS.COLLECTION.DOMAIN}${DOMAIN_ACCOUNT_ID}`, domain);

            const {result} = renderHook(() => useDomainGroupFilter(DOMAIN_ACCOUNT_ID));

            await waitFor(() => {
                expect(result.current.groupOptions).toHaveLength(2);
            });

            act(() => {
                result.current.handleGroupChange({text: 'Engineering', value: '1'});
            });
            expect(result.current.selectedGroup).not.toBeNull();

            act(() => {
                result.current.handleGroupChange({text: 'All Members', value: 'all'});
            });
            expect(result.current.selectedGroup).toBeNull();
        });

        it('should clear selectedGroup when null is passed', async () => {
            const domain = buildDomain({
                '1': {members: {'100': 'read'}, name: 'Engineering'},
            });
            await Onyx.merge(`${ONYXKEYS.COLLECTION.DOMAIN}${DOMAIN_ACCOUNT_ID}`, domain);

            const {result} = renderHook(() => useDomainGroupFilter(DOMAIN_ACCOUNT_ID));

            await waitFor(() => {
                expect(result.current.groupOptions).toHaveLength(2);
            });

            act(() => {
                result.current.handleGroupChange({text: 'Engineering', value: '1'});
            });
            expect(result.current.selectedGroup).not.toBeNull();

            act(() => {
                result.current.handleGroupChange(null);
            });
            expect(result.current.selectedGroup).toBeNull();
        });
    });

    describe('dropdownLabel', () => {
        it('should show "All Members" label when no group is selected', () => {
            const {result} = renderHook(() => useDomainGroupFilter(DOMAIN_ACCOUNT_ID));
            expect(result.current.dropdownLabel).toBe(result.current.allMembersLabel);
        });

        it('should show the selected group name as the label', async () => {
            const domain = buildDomain({
                '1': {members: {'100': 'read'}, name: 'Engineering'},
            });
            await Onyx.merge(`${ONYXKEYS.COLLECTION.DOMAIN}${DOMAIN_ACCOUNT_ID}`, domain);

            const {result} = renderHook(() => useDomainGroupFilter(DOMAIN_ACCOUNT_ID));

            await waitFor(() => {
                expect(result.current.groupOptions).toHaveLength(2);
            });

            act(() => {
                result.current.handleGroupChange({text: 'Engineering', value: '1'});
            });

            expect(result.current.dropdownLabel).toBe('Engineering');
        });

        it('should show "All Members" label when the selected group is removed from Onyx', async () => {
            const domain = buildDomain({
                '1': {members: {'100': 'read'}, name: 'Engineering'},
            });
            await Onyx.set(`${ONYXKEYS.COLLECTION.DOMAIN}${DOMAIN_ACCOUNT_ID}`, domain);

            const {result} = renderHook(() => useDomainGroupFilter(DOMAIN_ACCOUNT_ID));

            await waitFor(() => {
                expect(result.current.groupOptions).toHaveLength(2);
            });

            act(() => {
                result.current.handleGroupChange({text: 'Engineering', value: '1'});
            });
            expect(result.current.dropdownLabel).toBe('Engineering');
            expect(result.current.selectedGroup).not.toBeNull();

            // Replace the domain with one that no longer has the selected group
            const updatedDomain = buildDomain({
                '2': {members: {'200': 'read'}, name: 'Marketing'},
            });
            await Onyx.set(`${ONYXKEYS.COLLECTION.DOMAIN}${DOMAIN_ACCOUNT_ID}`, updatedDomain);

            await waitFor(() => {
                expect(result.current.groupOptions.find((o) => o.value === '1')).toBeUndefined();
            });

            expect(result.current.dropdownLabel).toBe(result.current.allMembersLabel);
            expect(result.current.selectedGroup).toBeNull();
            expect(result.current.groupPreFilter(buildMemberOption(100))).toBe(true);
        });

        it('should not reactivate the filter when a previously removed group reappears with the same ID (rollback scenario)', async () => {
            const domain = buildDomain({
                '1': {members: {'100': 'read'}, name: 'Engineering'},
            });
            await Onyx.set(`${ONYXKEYS.COLLECTION.DOMAIN}${DOMAIN_ACCOUNT_ID}`, domain);

            const {result} = renderHook(() => useDomainGroupFilter(DOMAIN_ACCOUNT_ID));

            await waitFor(() => {
                expect(result.current.groupOptions).toHaveLength(2);
            });

            // Select the group
            act(() => {
                result.current.handleGroupChange({text: 'Engineering', value: '1'});
            });
            expect(result.current.selectedGroup).not.toBeNull();

            // Group disappears from Onyx (e.g. optimistic update removed or data cleared)
            await Onyx.set(`${ONYXKEYS.COLLECTION.DOMAIN}${DOMAIN_ACCOUNT_ID}`, buildDomain({}));

            await waitFor(() => {
                expect(result.current.selectedGroup).toBeNull();
            });
            expect(result.current.dropdownLabel).toBe(result.current.allMembersLabel);

            // Group reappears with the same ID (rollback / re-sync)
            await Onyx.set(`${ONYXKEYS.COLLECTION.DOMAIN}${DOMAIN_ACCOUNT_ID}`, domain);

            await waitFor(() => {
                expect(result.current.groupOptions).toHaveLength(2);
            });

            // Filter must remain inactive — the previous selection was cleared from state
            expect(result.current.selectedGroup).toBeNull();
            expect(result.current.dropdownLabel).toBe(result.current.allMembersLabel);
            expect(result.current.groupPreFilter(buildMemberOption(100))).toBe(true);
            expect(result.current.groupPreFilter(buildMemberOption(999))).toBe(true);
        });
    });

    describe('groups', () => {
        it('should return empty array when no domain data exists', () => {
            const {result} = renderHook(() => useDomainGroupFilter(DOMAIN_ACCOUNT_ID));
            expect(result.current.groups).toEqual([]);
        });
        it('should return parsed security groups from Onyx', async () => {
            const domain = buildDomain({
                '1': {members: {'100': 'read'}, name: 'Engineering'},
                '2': {members: {'200': 'read'}, name: 'Marketing'},
            });
            await Onyx.merge(`${ONYXKEYS.COLLECTION.DOMAIN}${DOMAIN_ACCOUNT_ID}`, domain);

            const {result} = renderHook(() => useDomainGroupFilter(DOMAIN_ACCOUNT_ID));

            await waitFor(() => {
                expect(result.current.groups).toHaveLength(2);
            });

            expect(result.current.groups?.[0].id).toBe('1');
            expect(result.current.groups?.[0].details.name).toBe('Engineering');
            expect(result.current.groups?.[1].id).toBe('2');
            expect(result.current.groups?.[1].details.name).toBe('Marketing');
        });
    });
});
