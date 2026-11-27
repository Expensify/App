import formatTagParentPath from '@libs/formatTagParentPath';

import {getFittingTagLevel, getInsightsTagLevelNames, getInsightsTagLevelOptions, getInsightsTagPolicyIDs} from '@pages/Insights/insightsTagLevels';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy} from '@src/types/onyx';

import createRandomPolicy from '../utils/collections/policies';

const fallback = (level: number) => `Tag level ${level}`;

describe('Insights tag levels', () => {
    it('reads tag levels only from group workspaces with tags enabled', () => {
        // Given a tagged Collect workspace, an untagged one, a tagged personal one and a workspace Onyx just removed
        const buildPolicy = (id: string, type: Policy['type'], areTagsEnabled: boolean): Policy => ({...createRandomPolicy(Number(id), type), id, areTagsEnabled});
        const policies = {
            [`${ONYXKEYS.COLLECTION.POLICY}1`]: buildPolicy('1', CONST.POLICY.TYPE.TEAM, true),
            [`${ONYXKEYS.COLLECTION.POLICY}2`]: buildPolicy('2', CONST.POLICY.TYPE.TEAM, false),
            [`${ONYXKEYS.COLLECTION.POLICY}3`]: buildPolicy('3', CONST.POLICY.TYPE.PERSONAL, true),
            [`${ONYXKEYS.COLLECTION.POLICY}4`]: undefined,
        };

        // When the dashboard picks the workspaces whose tag lists set the levels on offer
        // Then only the tagged group workspace counts, since the others have no tag levels to chart
        expect(getInsightsTagPolicyIDs(policies)).toEqual(['1']);
    });

    it('uses positional names, falls back for conflicts, and keeps deeper levels from either workspace', () => {
        // Given different names at level two and a third level present in only one workspace
        const names = [
            ['Region', 'Office'],
            ['Region', 'Location', 'Project'],
        ];

        // When the selected workspaces build their common menu
        const options = getInsightsTagLevelOptions(names, fallback);

        // Then shared names stay configured and conflicts use their position
        expect(options).toEqual([
            {value: 1, label: 'Region'},
            {value: 2, label: 'Tag level 2'},
            {value: 3, label: 'Project'},
        ]);
        expect(getFittingTagLevel(3, options)).toBe(3);
        expect(getFittingTagLevel(4, options)).toBe(1);
    });

    it('reads tag-list order rather than object order', () => {
        // Given tag metadata arriving out of order
        const tags = {
            [`${ONYXKEYS.COLLECTION.POLICY_TAGS}A1`]: {
                second: {name: 'Office', orderWeight: 1, required: false, tags: {}},
                first: {name: 'Region', orderWeight: 0, required: false, tags: {}},
            },
        };

        // When the selector reads the configured positions
        const names = getInsightsTagLevelNames(tags, ['A1']);

        // Then workspace list order defines level positions
        expect(names).toEqual([['Region', 'Office']]);
    });

    it.each([undefined, ''])('keeps a level-one fallback without tag metadata %j', (path) => {
        // Given no configured lists or ancestors
        const names: string[][] = [];

        // When the menu and parent label are built
        const options = getInsightsTagLevelOptions(names, fallback);

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
});
