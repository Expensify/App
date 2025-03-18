import {Str} from 'expensify-common';
import CONST from '@src/CONST';

describe('Test short mention regex', () => {
    it('Should concat the private domain to proper short mentions only', () => {
        const testTexts = [
            '`sd` `` g @short\n`sd` `` g @short `\n`jkl @short-mention `jk` \n`sd` g @short\n`jkl @short-mention`',
            '`jkl` ``sth @short-mention jk`\n`jkl` ``sth`@short-mention` jk`\n`jkl @short-mention jk\n`jkl @short-mention jk\nj`k`l @short-mention` jk',
            '`jk`l @short-mention`sd `g @short`jk`l @short-mention`sd g @short\n`jk`l `@short-mention`sd g @short`jk`l @short-mention`sd g @short ``\njkl @short-mention`sd `g @short`jk`l @short-mention`sd g @short\n`jkl @short-mention`sd `g @short`jk`l @short-mention`sd g @short',
        ];
        const expectedValues = [
            '`sd` `` g @short@test.co\n`sd` `` g @short@test.co `\n`jkl @short-mention `jk` \n`sd` g @short@test.co\n`jkl @short-mention`',
            '`jkl` ``sth @short-mention@test.co jk`\n`jkl` ``sth`@short-mention` jk`\n`jkl @short-mention@test.co jk\n`jkl @short-mention@test.co jk\nj`k`l @short-mention@test.co` jk',
            '`jk`l @short-mention@test.co`sd `g @short@test.co`jk`l @short-mention@test.co`sd g @short@test.co\n`jk`l `@short-mention`sd g @short@test.co`jk`l @short-mention@test.co`sd g @short ``\njkl @short-mention@test.co`sd `g @short@test.co`jk`l @short-mention@test.co`sd g @short@test.co\n`jkl @short-mention`sd `g @short`jk`l @short-mention`sd g @short@test.co',
        ];

        testTexts.forEach((text, i) =>
            expect(
                text.replace(CONST.REGEX.SHORT_MENTION, (match) => {
                    if (!Str.isValidMention(match)) {
                        return match;
                    }
                    return `${match}@test.co`;
                }),
            ).toEqual(expectedValues.at(i)),
        );
    });
});
