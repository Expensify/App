import formatTagParentPath from '@libs/formatTagParentPath';

import {getFittingTagLevel, getInsightsTagLevelOptions} from '@pages/Insights/insightsTagLevels';

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
        const options = getInsightsTagLevelOptions(tagLevels, fallback);

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
        const options = getInsightsTagLevelOptions(tagLevels, fallback);

        // Then the level is still offered under its position
        expect(options).toEqual([
            {value: 1, label: 'Region'},
            {value: 2, label: 'Tag level 2'},
        ]);
    });

    it.each([undefined, ''])('keeps a level-one fallback without tag levels %j', (path) => {
        // Given no response yet and no ancestors
        // When the menu and parent label are built
        const options = getInsightsTagLevelOptions(undefined, fallback);

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
