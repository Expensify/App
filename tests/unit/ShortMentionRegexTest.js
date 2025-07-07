"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var expensify_common_1 = require("expensify-common");
var CONST_1 = require("@src/CONST");
describe('Test short mention regex', function () {
    it('Should concat the private domain to proper short mentions only', function () {
        var testTexts = [
            '`sd` `` g @short\n`sd` `` g @short `\n`jkl @short-mention `jk` \n`sd` g @short\n`jkl @short-mention`',
            '`jkl` ``sth @short-mention jk`\n`jkl` ``sth`@short-mention` jk`\n`jkl @short-mention jk\n`jkl @short-mention jk\nj`k`l @short-mention` jk',
            // cspell:disable-next-line
            '`jk`l @short-mention`sd `g @short`jk`l @short-mention`sd g @short\n`jk`l `@short-mention`sd g @short`jk`l @short-mention`sd g @short ``\njkl @short-mention`sd `g @short`jk`l @short-mention`sd g @short\n`jkl @short-mention`sd `g @short`jk`l @short-mention`sd g @short',
        ];
        var expectedValues = [
            '`sd` `` g @short@test.co\n`sd` `` g @short@test.co `\n`jkl @short-mention `jk` \n`sd` g @short@test.co\n`jkl @short-mention`',
            '`jkl` ``sth @short-mention@test.co jk`\n`jkl` ``sth`@short-mention` jk`\n`jkl @short-mention@test.co jk\n`jkl @short-mention@test.co jk\nj`k`l @short-mention@test.co` jk',
            // cspell:disable-next-line
            '`jk`l @short-mention@test.co`sd `g @short@test.co`jk`l @short-mention@test.co`sd g @short@test.co\n`jk`l `@short-mention`sd g @short@test.co`jk`l @short-mention@test.co`sd g @short ``\njkl @short-mention@test.co`sd `g @short@test.co`jk`l @short-mention@test.co`sd g @short@test.co\n`jkl @short-mention`sd `g @short`jk`l @short-mention`sd g @short@test.co',
        ];
        testTexts.forEach(function (text, i) {
            return expect(text.replace(CONST_1.default.REGEX.SHORT_MENTION, function (match) {
                if (!expensify_common_1.Str.isValidMention(match)) {
                    return match;
                }
                return "".concat(match, "@test.co");
            })).toEqual(expectedValues.at(i));
        });
    });
});
