/* eslint-disable @typescript-eslint/naming-convention */
import {act, renderHook, waitFor} from '@testing-library/react-native';
import React from 'react';
import Onyx from 'react-native-onyx';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import type {MultiSelectItem} from '@components/Search/FilterDropdowns/MultiSelectPopup';
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
        it('should return empty selectedGroups initially', () => {
            const {result} = renderHook(() => useDomainGroupFilter(DOMAIN_ACCOUNT_ID));
            expect(result.current.selectedGroups).toEqual([]);
        });

        it('should return the default dropdown label when no group is selected', () => {
            const {result} = renderHook(() => useDomainGroupFilter(DOMAIN_ACCOUNT_ID));
            expect(result.current.dropdownLabel).toEqual(expect.any(String));
        });

        it('should return empty groupOptions when no groups exist in Onyx', () => {
            const {result} = renderHook(() => useDomainGroupFilter(DOMAIN_ACCOUNT_ID));
            expect(result.current.groupOptions).toHaveLength(0);
        });
    });

    describe('groupOptions', () => {
        it('should return empty array when no groups exist in Onyx', () => {
            const {result} = renderHook(() => useDomainGroupFilter(DOMAIN_ACCOUNT_ID));
            expect(result.current.groupOptions).toHaveLength(0);
        });

        it('should list all security groups from the domain', async () => {
            const domain = buildDomain({
                '1': {members: {'100': 'read', '200': 'read'}, name: 'Engineering'},
                '2': {members: {'300': 'read'}, name: 'Marketing'},
            });
            await Onyx.merge(`${ONYXKEYS.COLLECTION.DOMAIN}${DOMAIN_ACCOUNT_ID}`, domain);

            const {result} = renderHook(() => useDomainGroupFilter(DOMAIN_ACCOUNT_ID));

            await waitFor(() => {
                expect(result.current.groupOptions).toHaveLength(2);
            });

            expect(result.current.groupOptions.at(0)).toEqual({text: 'Engineering', value: '1'});
            expect(result.current.groupOptions.at(1)).toEqual({text: 'Marketing', value: '2'});
        });
    });

    describe('groupPreFilter', () => {
        it('should allow all members through when no group is selected', () => {
            const {result} = renderHook(() => useDomainGroupFilter(DOMAIN_ACCOUNT_ID));

            expect(result.current.groupPreFilter(buildMemberOption(100))).toBe(true);
            expect(result.current.groupPreFilter(buildMemberOption(999))).toBe(true);
        });

        it('should filter members to a single selected group', async () => {
            const domain = buildDomain({
                '1': {members: {'100': 'read', '200': 'read'}, name: 'Engineering'},
                '2': {members: {'300': 'read'}, name: 'Marketing'},
            });
            await Onyx.merge(`${ONYXKEYS.COLLECTION.DOMAIN}${DOMAIN_ACCOUNT_ID}`, domain);

            const {result} = renderHook(() => useDomainGroupFilter(DOMAIN_ACCOUNT_ID));

            await waitFor(() => {
                expect(result.current.groupOptions).toHaveLength(2);
            });

            act(() => {
                result.current.handleGroupChange([{text: 'Engineering', value: '1'}]);
            });

            expect(result.current.groupPreFilter(buildMemberOption(100))).toBe(true);
            expect(result.current.groupPreFilter(buildMemberOption(200))).toBe(true);
            expect(result.current.groupPreFilter(buildMemberOption(300))).toBe(false);
        });

        it('should show the union of members when multiple groups are selected', async () => {
            const domain = buildDomain({
                '1': {members: {'100': 'read'}, name: 'Engineering'},
                '2': {members: {'200': 'read'}, name: 'Marketing'},
            });
            await Onyx.merge(`${ONYXKEYS.COLLECTION.DOMAIN}${DOMAIN_ACCOUNT_ID}`, domain);

            const {result} = renderHook(() => useDomainGroupFilter(DOMAIN_ACCOUNT_ID));

            await waitFor(() => {
                expect(result.current.groupOptions).toHaveLength(2);
            });

            act(() => {
                result.current.handleGroupChange([
                    {text: 'Engineering', value: '1'},
                    {text: 'Marketing', value: '2'},
                ]);
            });

            expect(result.current.groupPreFilter(buildMemberOption(100))).toBe(true);
            expect(result.current.groupPreFilter(buildMemberOption(200))).toBe(true);
            expect(result.current.groupPreFilter(buildMemberOption(999))).toBe(false);
        });

        it('should allow all members again after clearing the selection', async () => {
            const domain = buildDomain({
                '1': {members: {'100': 'read'}, name: 'Group 1'},
                '2': {members: {'200': 'read'}, name: 'Group 2'},
            });
            await Onyx.merge(`${ONYXKEYS.COLLECTION.DOMAIN}${DOMAIN_ACCOUNT_ID}`, domain);

            const {result} = renderHook(() => useDomainGroupFilter(DOMAIN_ACCOUNT_ID));

            await waitFor(() => {
                expect(result.current.groupOptions).toHaveLength(2);
            });

            act(() => {
                result.current.handleGroupChange([{text: 'Group 1', value: '1'}]);
            });
            expect(result.current.groupPreFilter(buildMemberOption(200))).toBe(false);

            act(() => {
                result.current.handleGroupChange([]);
            });
            expect(result.current.groupPreFilter(buildMemberOption(200))).toBe(true);
        });
    });

    describe('handleGroupChange', () => {
        it('should set selectedGroups when groups are chosen', async () => {
            const domain = buildDomain({
                '1': {members: {'100': 'read'}, name: 'Engineering'},
            });
            await Onyx.merge(`${ONYXKEYS.COLLECTION.DOMAIN}${DOMAIN_ACCOUNT_ID}`, domain);

            const {result} = renderHook(() => useDomainGroupFilter(DOMAIN_ACCOUNT_ID));

            await waitFor(() => {
                expect(result.current.groupOptions).toHaveLength(1);
            });

            act(() => {
                result.current.handleGroupChange([{text: 'Engineering', value: '1'}]);
            });

            expect(result.current.selectedGroups).toEqual([{text: 'Engineering', value: '1'}]);
        });

        it('should support selecting multiple groups simultaneously', async () => {
            const domain = buildDomain({
                '1': {members: {'100': 'read'}, name: 'Engineering'},
                '2': {members: {'200': 'read'}, name: 'Marketing'},
            });
            await Onyx.merge(`${ONYXKEYS.COLLECTION.DOMAIN}${DOMAIN_ACCOUNT_ID}`, domain);

            const {result} = renderHook(() => useDomainGroupFilter(DOMAIN_ACCOUNT_ID));

            await waitFor(() => {
                expect(result.current.groupOptions).toHaveLength(2);
            });

            const selection: Array<MultiSelectItem<string>> = [
                {text: 'Engineering', value: '1'},
                {text: 'Marketing', value: '2'},
            ];
            act(() => {
                result.current.handleGroupChange(selection);
            });

            expect(result.current.selectedGroups).toHaveLength(2);
            expect(result.current.selectedGroups).toEqual(selection);
        });

        it('should clear selectedGroups when an empty array is passed', async () => {
            const domain = buildDomain({
                '1': {members: {'100': 'read'}, name: 'Engineering'},
            });
            await Onyx.merge(`${ONYXKEYS.COLLECTION.DOMAIN}${DOMAIN_ACCOUNT_ID}`, domain);

            const {result} = renderHook(() => useDomainGroupFilter(DOMAIN_ACCOUNT_ID));

            await waitFor(() => {
                expect(result.current.groupOptions).toHaveLength(1);
            });

            act(() => {
                result.current.handleGroupChange([{text: 'Engineering', value: '1'}]);
            });
            expect(result.current.selectedGroups).toHaveLength(1);

            act(() => {
                result.current.handleGroupChange([]);
            });
            expect(result.current.selectedGroups).toHaveLength(0);
        });
    });

    describe('dropdownLabel', () => {
        function LocaleWrapper({children}: {children: React.ReactNode}) {
            return React.createElement(LocaleContextProvider, null, children);
        }

        it('should show the default label when no group is selected', async () => {
            const domain = buildDomain({
                '1': {members: {'100': 'read'}, name: 'Engineering'},
            });
            await Onyx.merge(`${ONYXKEYS.COLLECTION.DOMAIN}${DOMAIN_ACCOUNT_ID}`, domain);

            const {result} = renderHook(() => useDomainGroupFilter(DOMAIN_ACCOUNT_ID), {wrapper: LocaleWrapper});
            const defaultLabel = result.current.dropdownLabel;

            await waitFor(() => {
                expect(result.current.groupOptions).toHaveLength(1);
            });

            act(() => {
                result.current.handleGroupChange([{text: 'Engineering', value: '1'}]);
            });
            expect(result.current.dropdownLabel).not.toBe(defaultLabel);

            act(() => {
                result.current.handleGroupChange([]);
            });
            expect(result.current.dropdownLabel).toBe(defaultLabel);
        });

        it('should show the selected group name as the label', async () => {
            const domain = buildDomain({
                '1': {members: {'100': 'read'}, name: 'Engineering'},
            });
            await Onyx.merge(`${ONYXKEYS.COLLECTION.DOMAIN}${DOMAIN_ACCOUNT_ID}`, domain);

            const {result} = renderHook(() => useDomainGroupFilter(DOMAIN_ACCOUNT_ID), {wrapper: LocaleWrapper});

            await waitFor(() => {
                expect(result.current.groupOptions).toHaveLength(1);
            });

            act(() => {
                result.current.handleGroupChange([{text: 'Engineering', value: '1'}]);
            });

            expect(result.current.dropdownLabel).toBe('Group: Engineering');
        });

        it('should show comma-joined names when multiple groups are selected', async () => {
            const domain = buildDomain({
                '1': {members: {'100': 'read'}, name: 'Engineering'},
                '2': {members: {'200': 'read'}, name: 'Marketing'},
            });
            await Onyx.merge(`${ONYXKEYS.COLLECTION.DOMAIN}${DOMAIN_ACCOUNT_ID}`, domain);

            const {result} = renderHook(() => useDomainGroupFilter(DOMAIN_ACCOUNT_ID), {wrapper: LocaleWrapper});

            await waitFor(() => {
                expect(result.current.groupOptions).toHaveLength(2);
            });

            act(() => {
                result.current.handleGroupChange([
                    {text: 'Engineering', value: '1'},
                    {text: 'Marketing', value: '2'},
                ]);
            });

            expect(result.current.dropdownLabel).toBe('Group: Engineering, Marketing');
        });

        it('should revert to the default label when selected groups are removed from Onyx', async () => {
            const domain = buildDomain({
                '1': {members: {'100': 'read'}, name: 'Engineering'},
            });
            await Onyx.set(`${ONYXKEYS.COLLECTION.DOMAIN}${DOMAIN_ACCOUNT_ID}`, domain);

            const {result} = renderHook(() => useDomainGroupFilter(DOMAIN_ACCOUNT_ID), {wrapper: LocaleWrapper});
            const defaultLabel = result.current.dropdownLabel;

            await waitFor(() => {
                expect(result.current.groupOptions).toHaveLength(1);
            });

            act(() => {
                result.current.handleGroupChange([{text: 'Engineering', value: '1'}]);
            });
            expect(result.current.dropdownLabel).toBe('Group: Engineering');

            // Replace the domain with one that no longer has the selected group
            const updatedDomain = buildDomain({
                '2': {members: {'200': 'read'}, name: 'Marketing'},
            });
            await Onyx.set(`${ONYXKEYS.COLLECTION.DOMAIN}${DOMAIN_ACCOUNT_ID}`, updatedDomain);

            await waitFor(() => {
                expect(result.current.groupOptions.find((o) => o.value === '1')).toBeUndefined();
            });

            expect(result.current.dropdownLabel).toBe(defaultLabel);
            expect(result.current.selectedGroups).toHaveLength(0);
            expect(result.current.groupPreFilter(buildMemberOption(100))).toBe(true);
        });

        it('should not reactivate the filter when a previously removed group reappears with the same ID (rollback scenario)', async () => {
            const domain = buildDomain({
                '1': {members: {'100': 'read'}, name: 'Engineering'},
            });
            await Onyx.set(`${ONYXKEYS.COLLECTION.DOMAIN}${DOMAIN_ACCOUNT_ID}`, domain);

            const {result} = renderHook(() => useDomainGroupFilter(DOMAIN_ACCOUNT_ID), {wrapper: LocaleWrapper});
            const defaultLabel = result.current.dropdownLabel;

            await waitFor(() => {
                expect(result.current.groupOptions).toHaveLength(1);
            });

            // Select the group
            act(() => {
                result.current.handleGroupChange([{text: 'Engineering', value: '1'}]);
            });
            expect(result.current.selectedGroups).toHaveLength(1);

            // Group disappears from Onyx (e.g. optimistic update removed or data cleared)
            await Onyx.set(`${ONYXKEYS.COLLECTION.DOMAIN}${DOMAIN_ACCOUNT_ID}`, buildDomain({}));

            await waitFor(() => {
                expect(result.current.selectedGroups).toHaveLength(0);
            });
            expect(result.current.dropdownLabel).toBe(defaultLabel);

            // Group reappears with the same ID (rollback / re-sync)
            await Onyx.set(`${ONYXKEYS.COLLECTION.DOMAIN}${DOMAIN_ACCOUNT_ID}`, domain);

            await waitFor(() => {
                expect(result.current.groupOptions).toHaveLength(1);
            });

            // Filter must remain inactive — the previous selection was cleared from state
            expect(result.current.selectedGroups).toHaveLength(0);
            expect(result.current.dropdownLabel).toBe(defaultLabel);
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
