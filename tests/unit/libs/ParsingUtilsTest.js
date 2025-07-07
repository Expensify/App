"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ParsingUtils_1 = require("@libs/ParsingUtils");
describe('decorateRangesWithShortMentions', function () {
    test('returns empty list for empty text', function () {
        var result = (0, ParsingUtils_1.decorateRangesWithShortMentions)([], '', [], []);
        expect(result).toEqual([]);
    });
    test('returns empty list when there are no relevant mentions', function () {
        var text = 'Lorem ipsum';
        var result = (0, ParsingUtils_1.decorateRangesWithShortMentions)([], text, [], []);
        expect(result).toEqual([]);
    });
    test('returns unchanged ranges when there are other markups than user-mentions', function () {
        var text = 'Lorem ipsum';
        var ranges = [
            {
                type: 'bold',
                start: 5,
                length: 3,
            },
        ];
        var result = (0, ParsingUtils_1.decorateRangesWithShortMentions)(ranges, text, []);
        expect(result).toEqual([
            {
                type: 'bold',
                start: 5,
                length: 3,
            },
        ]);
    });
    test('returns ranges with current user type changed to "mention-here" for short-mention', function () {
        var text = 'Lorem ipsum @myUser';
        var ranges = [
            {
                type: 'mention-short',
                start: 12,
                length: 8,
            },
        ];
        var result = (0, ParsingUtils_1.decorateRangesWithShortMentions)(ranges, text, [], ['@myUser']);
        expect(result).toEqual([
            {
                type: 'mention-here',
                start: 12,
                length: 8,
            },
        ]);
    });
    test('returns ranges with current user type changed to "mention-here" for full mention', function () {
        var text = 'Lorem ipsum @myUser.email.com';
        var ranges = [
            {
                type: 'mention-user',
                start: 12,
                length: 17,
            },
        ];
        var result = (0, ParsingUtils_1.decorateRangesWithShortMentions)(ranges, text, [], ['@myUser.email.com']);
        expect(result).toEqual([
            {
                type: 'mention-here',
                start: 12,
                length: 17,
            },
        ]);
    });
    test('returns ranges with correct short-mentions', function () {
        var text = 'Lorem ipsum @steven.mock';
        var ranges = [
            {
                type: 'mention-short',
                start: 12,
                length: 12,
            },
        ];
        var availableMentions = ['@johnDoe', '@steven.mock'];
        var result = (0, ParsingUtils_1.decorateRangesWithShortMentions)(ranges, text, availableMentions, []);
        expect(result).toEqual([
            {
                type: 'mention-user',
                start: 12,
                length: 12,
            },
        ]);
    });
    test('returns ranges with removed short-mentions when they do not match', function () {
        var text = 'Lorem ipsum @steven.mock';
        var ranges = [
            {
                type: 'bold',
                start: 5,
                length: 3,
            },
            {
                type: 'mention-short',
                start: 12,
                length: 12,
            },
        ];
        var availableMentions = ['@other.person'];
        var result = (0, ParsingUtils_1.decorateRangesWithShortMentions)(ranges, text, availableMentions, []);
        expect(result).toEqual([
            {
                type: 'bold',
                start: 5,
                length: 3,
            },
        ]);
    });
    test('returns ranges with both types of mentions handled', function () {
        var text = 'Lorem ipsum @steven.mock @John.current @test';
        var ranges = [
            {
                type: 'bold',
                start: 5,
                length: 3,
            },
            {
                type: 'mention-short',
                start: 12,
                length: 12,
            },
            {
                type: 'mention-short',
                start: 25,
                length: 13,
            },
        ];
        var availableMentions = ['@johnDoe', '@steven.mock', '@John.current'];
        var currentUsers = ['@John.current'];
        var result = (0, ParsingUtils_1.decorateRangesWithShortMentions)(ranges, text, availableMentions, currentUsers);
        expect(result).toEqual([
            {
                type: 'bold',
                start: 5,
                length: 3,
            },
            {
                type: 'mention-user',
                start: 12,
                length: 12,
            },
            {
                type: 'mention-here',
                start: 25,
                length: 13,
            },
        ]);
    });
});
