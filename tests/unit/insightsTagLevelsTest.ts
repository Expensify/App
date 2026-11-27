import formatTagParentPath from '@libs/formatTagParentPath';

import {getCachedTagLevels, getFittingTagLevel, getInsightsTagLevelOptions, getStoredTagLevels, isTagLevelFallbackPending} from '@pages/Insights/insightsTagLevels';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {PolicyTagLists} from '@src/types/onyx';
import type {InsightsTagLevel} from '@src/types/onyx/InsightsDashboard';

import type {OnyxCollection} from 'react-native-onyx';

const fallback = (level: number) => `Tag level ${level}`;

describe('Insights tag levels', () => {
    it('names a level only when its workspaces agree, and keeps levels only some workspaces have', () => {
        // Given workspaces that agree on level one, differ on level two, and have a third level in only one of them
        const tagLevels = [
            {level: 1, names: ['Region']},
            {level: 2, names: ['Office', 'Location']},
            {level: 3, names: ['Project']},
        ];

        // When the menu is built from them
        const options = getInsightsTagLevelOptions(tagLevels, undefined, fallback);

        // Then shared names stay configured and conflicts use their position
        expect(options).toEqual([
            {value: 1, label: 'Region'},
            {value: 2, label: 'Tag level 2'},
            {value: 3, label: 'Project'},
        ]);
        expect(getFittingTagLevel(3, tagLevels)).toBe(3);
        expect(getFittingTagLevel(4, tagLevels)).toBe(1);
        expect(getFittingTagLevel(1, [])).toBe(1);
    });

    it('uses the numbered label for a level whose lists have no name', () => {
        // Given a level the workspaces left unnamed
        const tagLevels = [
            {level: 1, names: ['Region']},
            {level: 2, names: []},
        ];

        // When the menu is built from it
        const options = getInsightsTagLevelOptions(tagLevels, undefined, fallback);

        // Then the level is still offered under its position
        expect(options).toEqual([
            {value: 1, label: 'Region'},
            {value: 2, label: 'Tag level 2'},
        ]);
    });

    it.each([undefined, ''])('keeps a level-one fallback without tag levels %j', (path) => {
        // Given no response yet and no ancestors
        // When the menu and parent label are built
        const options = getInsightsTagLevelOptions(undefined, undefined, fallback);

        // Then the safe default is level one and independent tags have no parent label
        expect(options).toEqual([{value: 1, label: 'Tag level 1'}]);
        expect(formatTagParentPath(path)).toBe('');
    });

    it('decodes ancestors without splitting literal escaped separators', () => {
        // Given encoded colons, backslashes and HTML entities in ancestor names
        const path = 'US:New\\: York:Path\\\\name &amp; Co';

        // When the dependent row renders its ancestor path
        const label = formatTagParentPath(path);

        // Then only real level separators become breadcrumbs
        expect(label).toBe('US › New: York › Path\\name & Co');
    });

    it('keeps the selected level in the menu when the levels leave it out', () => {
        // Given levels that stop at one while level three is selected
        // When the menu is built
        const options = getInsightsTagLevelOptions([{level: 1, names: ['Region']}], 3, fallback);

        // Then the selected level stays offered under its position, so the user can switch back
        expect(options).toEqual([
            {value: 1, label: 'Region'},
            {value: 3, label: 'Tag level 3'},
        ]);
    });

    describe('getCachedTagLevels', () => {
        const tagList = (name: string, orderWeight: number) => ({name, orderWeight, required: false, tags: {}});

        it('builds levels from the tag lists on the device, in list order, across workspaces', () => {
            // Given two workspaces with tag lists on the device, one stored out of order
            const policyTags: OnyxCollection<PolicyTagLists> = {
                [`${ONYXKEYS.COLLECTION.POLICY_TAGS}A`]: {Project: tagList('Project', 1), Department: tagList('Department', 0)},
                [`${ONYXKEYS.COLLECTION.POLICY_TAGS}B`]: {Region: tagList('Region', 0)},
            };

            // When levels are built for both
            // Then each position collects the names the workspaces give it
            expect(getCachedTagLevels(policyTags, ['A', 'B'])).toEqual([
                {level: 1, names: ['Department', 'Region']},
                {level: 2, names: ['Project']},
            ]);
        });

        it('has nothing to offer when no workspace in scope has tag lists on the device', () => {
            // Given tag lists only for a workspace outside the scope
            const policyTags = {[`${ONYXKEYS.COLLECTION.POLICY_TAGS}A`]: {Department: tagList('Department', 0)}};

            // When levels are built for another workspace
            // Then there are none, so the menu falls back to its default
            expect(getCachedTagLevels(policyTags, ['B'])).toBeUndefined();
        });
    });

    describe('isTagLevelFallbackPending', () => {
        const oneLevel: InsightsTagLevel[] = [{level: 1, names: ['Region']}];
        const twoLevels: InsightsTagLevel[] = [...oneLevel, {level: 2, names: []}];

        it('waits for the fallback when the levels leave out the selected level', () => {
            // Given levels from workspaces that only have level one while level two is selected
            // When the dashboard checks them while it can still fetch again
            // Then the level is about to fall back, so Top tags waits instead of showing an empty chart
            expect(isTagLevelFallbackPending(oneLevel, 2, true)).toBe(true);
        });

        it.each([
            ['the levels list the selected level', twoLevels, 2, true],
            ['the default level is selected', oneLevel, 1, true],
            ['no levels are known yet', undefined, 2, true],
            ['nothing will be fetched again, offline or after a failed request', oneLevel, 2, false],
        ])('does not wait when %s', (_, tagLevels, selectedTagLevel, canFetchAgain) => {
            // Given levels and a selected level
            // When the dashboard checks them
            // Then Top tags shows what it has, since no fallback is coming
            expect(isTagLevelFallbackPending(tagLevels, selectedTagLevel, canFetchAgain)).toBe(false);
        });
    });

    describe('getStoredTagLevels', () => {
        const levels = [{level: 1, names: ['Region']}];
        const spendKey = (hash: number) => `${ONYXKEYS.COLLECTION.INSIGHTS}${CONST.INSIGHTS.DASHBOARD.SPEND}_${hash}` as const;

        it('matches the workspaces in any order', () => {
            // Given a stored response for two workspaces
            const dashboards = {[spendKey(1)]: {inputQuery: 'groupBy:month policyID:A,B date:this-month', tagLevels: levels}};

            // When the same workspaces are selected in another order
            // Then its levels are found
            expect(getStoredTagLevels(dashboards, ['B', 'A'])).toBe(levels);
        });

        it('tells all workspaces apart from a selection', () => {
            // Given a stored response for all workspaces
            const dashboards = {[spendKey(1)]: {inputQuery: 'groupBy:month date:this-month', tagLevels: levels}};

            // When all workspaces or one workspace is selected
            // Then only the all-workspaces scope finds its levels
            expect(getStoredTagLevels(dashboards, [])).toBe(levels);
            expect(getStoredTagLevels(dashboards, ['A'])).toBeUndefined();
        });

        it('prefers the newest stored response for the workspaces', () => {
            // Given an older one-level response, a newer two-level response, and a response stored without a request time, for the same workspace
            const newerLevels = [...levels, {level: 2, names: ['Office']}];
            const dashboards = {
                [spendKey(1)]: {inputQuery: 'policyID:A date:last-month', tagLevels: levels, requestedAt: 10},
                [spendKey(2)]: {inputQuery: 'policyID:A date:this-month', tagLevels: newerLevels, requestedAt: 20},
                [spendKey(3)]: {inputQuery: 'policyID:A date:last-12-months', tagLevels: levels},
            };

            // When workspace A is selected
            // Then the newer levels are found
            expect(getStoredTagLevels(dashboards, ['A'])).toBe(newerLevels);
        });

        it('skips other dashboards and responses without levels', () => {
            // Given a Compliance entry and a Spend entry without levels for the same workspace
            const dashboards = {
                [`${ONYXKEYS.COLLECTION.INSIGHTS}${CONST.INSIGHTS.DASHBOARD.COMPLIANCE}_1`]: {inputQuery: 'policyID:A date:this-month', tagLevels: levels},
                [spendKey(2)]: {inputQuery: 'policyID:A date:this-month'},
            };

            // When workspace A is selected
            // Then neither entry provides levels
            expect(getStoredTagLevels(dashboards, ['A'])).toBeUndefined();
        });
    });
});
