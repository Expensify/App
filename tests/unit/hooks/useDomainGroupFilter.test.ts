/* eslint-disable @typescript-eslint/naming-convention */
import {renderHook, waitFor} from '@testing-library/react-native';

import type {DomainMemberRowData} from '@components/Tables/DomainMembersTable';

import useDomainGroupFilter from '@hooks/useDomainGroupFilter';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type Domain from '@src/types/onyx/Domain';

import Onyx from 'react-native-onyx';

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

function buildMemberRow(accountID: number): DomainMemberRowData {
    return {
        accountID,
        login: `user${accountID}@test.com`,
        keyForList: String(accountID),
        name: `User ${accountID}`,
        email: `user${accountID}@test.com`,
        groupName: '-',
        action: () => {},
        dismissError: () => {},
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
        it('should not show the group filter when no groups exist', () => {
            const {result} = renderHook(() => useDomainGroupFilter(DOMAIN_ACCOUNT_ID));
            expect(result.current.shouldShowGroupFilter).toBe(false);
            expect(result.current.filterConfig).toBeUndefined();
        });

        it('should not show the group column when no groups exist', () => {
            const {result} = renderHook(() => useDomainGroupFilter(DOMAIN_ACCOUNT_ID));
            expect(result.current.shouldShowGroupColumn).toBe(false);
        });
    });

    describe('filterConfig', () => {
        it('should not include a filter config when only one group exists', async () => {
            const domain = buildDomain({
                '1': {members: {'100': 'read'}, name: 'Engineering'},
            });
            await Onyx.merge(`${ONYXKEYS.COLLECTION.DOMAIN}${DOMAIN_ACCOUNT_ID}`, domain);

            const {result} = renderHook(() => useDomainGroupFilter(DOMAIN_ACCOUNT_ID));

            await waitFor(() => {
                expect(result.current.groups).toHaveLength(1);
            });

            expect(result.current.shouldShowGroupFilter).toBe(false);
            expect(result.current.filterConfig).toBeUndefined();
            expect(result.current.shouldShowGroupColumn).toBe(true);
        });

        it('should sort security groups alphabetically by name in the filter options', async () => {
            const domain = buildDomain({
                '2': {members: {'300': 'read'}, name: 'Marketing'},
                '1': {members: {'100': 'read', '200': 'read'}, name: 'Engineering'},
            });
            await Onyx.merge(`${ONYXKEYS.COLLECTION.DOMAIN}${DOMAIN_ACCOUNT_ID}`, domain);

            const {result} = renderHook(() => useDomainGroupFilter(DOMAIN_ACCOUNT_ID));

            await waitFor(() => {
                expect(result.current.filterConfig?.group.options).toHaveLength(2);
            });

            expect(result.current.filterConfig?.group.filterType).toBe(CONST.TABLES.FILTER_TYPE.MULTI_SELECT);
            expect(result.current.filterConfig?.group.options.at(0)).toEqual({
                label: 'Engineering',
                value: '1',
            });
            expect(result.current.filterConfig?.group.options.at(1)).toEqual({
                label: 'Marketing',
                value: '2',
            });
        });
    });

    describe('isItemInFilter', () => {
        it('should allow all members through when no group filter is active', () => {
            const {result} = renderHook(() => useDomainGroupFilter(DOMAIN_ACCOUNT_ID));
            expect(result.current.isItemInFilter).toBeUndefined();
        });

        it('should allow all members through when no groups are selected', async () => {
            const domain = buildDomain({
                '1': {members: {'100': 'read', '200': 'read'}, name: 'Engineering'},
                '2': {members: {'300': 'read'}, name: 'Marketing'},
            });
            await Onyx.merge(`${ONYXKEYS.COLLECTION.DOMAIN}${DOMAIN_ACCOUNT_ID}`, domain);

            const {result} = renderHook(() => useDomainGroupFilter(DOMAIN_ACCOUNT_ID));

            await waitFor(() => {
                expect(result.current.isItemInFilter).toBeDefined();
            });

            expect(result.current.isItemInFilter?.(buildMemberRow(100), [])).toBe(true);
            expect(result.current.isItemInFilter?.(buildMemberRow(999), [])).toBe(true);
        });

        it('should filter members to a single selected group', async () => {
            const domain = buildDomain({
                '1': {members: {'100': 'read', '200': 'read'}, name: 'Engineering'},
                '2': {members: {'300': 'read'}, name: 'Marketing'},
            });
            await Onyx.merge(`${ONYXKEYS.COLLECTION.DOMAIN}${DOMAIN_ACCOUNT_ID}`, domain);

            const {result} = renderHook(() => useDomainGroupFilter(DOMAIN_ACCOUNT_ID));

            await waitFor(() => {
                expect(result.current.isItemInFilter).toBeDefined();
            });

            expect(result.current.isItemInFilter?.(buildMemberRow(100), ['1'])).toBe(true);
            expect(result.current.isItemInFilter?.(buildMemberRow(200), ['1'])).toBe(true);
            expect(result.current.isItemInFilter?.(buildMemberRow(300), ['1'])).toBe(false);
        });

        it('should show the union of members when multiple groups are selected', async () => {
            const domain = buildDomain({
                '1': {members: {'100': 'read'}, name: 'Engineering'},
                '2': {members: {'200': 'read'}, name: 'Marketing'},
            });
            await Onyx.merge(`${ONYXKEYS.COLLECTION.DOMAIN}${DOMAIN_ACCOUNT_ID}`, domain);

            const {result} = renderHook(() => useDomainGroupFilter(DOMAIN_ACCOUNT_ID));

            await waitFor(() => {
                expect(result.current.isItemInFilter).toBeDefined();
            });

            expect(result.current.isItemInFilter?.(buildMemberRow(100), ['1', '2'])).toBe(true);
            expect(result.current.isItemInFilter?.(buildMemberRow(200), ['1', '2'])).toBe(true);
            expect(result.current.isItemInFilter?.(buildMemberRow(999), ['1', '2'])).toBe(false);
        });

        it('should exclude members when the selected group is not found', async () => {
            const domain = buildDomain({
                '1': {members: {'100': 'read'}, name: 'Group 1'},
                '2': {members: {'200': 'read'}, name: 'Group 2'},
            });
            await Onyx.merge(`${ONYXKEYS.COLLECTION.DOMAIN}${DOMAIN_ACCOUNT_ID}`, domain);

            const {result} = renderHook(() => useDomainGroupFilter(DOMAIN_ACCOUNT_ID));

            await waitFor(() => {
                expect(result.current.isItemInFilter).toBeDefined();
            });

            expect(result.current.isItemInFilter?.(buildMemberRow(100), ['doesNotExist'])).toBe(false);
            expect(result.current.isItemInFilter?.(buildMemberRow(999), ['doesNotExist'])).toBe(false);
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
