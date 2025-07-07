"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var SuggestionMention_1 = require("@pages/home/report/ReportActionCompose/SuggestionMention");
describe('compareUserInList', function () {
    it('Should compare the weight if the weight is different', function () {
        var first = { login: 'John Doe', weight: 1, accountID: 1 };
        var second = { login: 'Jane Doe', weight: 2, accountID: 2 };
        expect((0, SuggestionMention_1.compareUserInList)(first, second)).toBe(-1);
        expect((0, SuggestionMention_1.compareUserInList)(second, first)).toBe(1);
    });
    it('Should compare the displayName if the weight is the same', function () {
        var first = { login: 'águero', weight: 2, accountID: 3 };
        var second = { login: 'Bronn', weight: 2, accountID: 4 };
        var third = { login: 'Carol', weight: 2, accountID: 5 };
        expect((0, SuggestionMention_1.compareUserInList)(first, second)).toBe(-1);
        expect((0, SuggestionMention_1.compareUserInList)(first, third)).toBe(-1);
        expect((0, SuggestionMention_1.compareUserInList)(second, third)).toBe(-1);
        expect((0, SuggestionMention_1.compareUserInList)(second, first)).toBe(1);
        expect((0, SuggestionMention_1.compareUserInList)(third, first)).toBe(1);
        expect((0, SuggestionMention_1.compareUserInList)(third, second)).toBe(1);
    });
    it('Should compare the accountID if both the weight and displayName are the same', function () {
        var first = { login: 'aguero', weight: 2, accountID: 6 };
        var second = { login: 'aguero', weight: 2, accountID: 7 };
        expect((0, SuggestionMention_1.compareUserInList)(first, second)).toBe(-1);
        expect((0, SuggestionMention_1.compareUserInList)(second, first)).toBe(1);
    });
    it('Should compare the displayName with different diacritics if the weight is the same', function () {
        var first = { login: 'águero', weight: 2, accountID: 8 };
        var second = { login: 'aguero', weight: 2, accountID: 8 };
        expect((0, SuggestionMention_1.compareUserInList)(first, second)).toBe(1);
        expect((0, SuggestionMention_1.compareUserInList)(second, first)).toBe(-1);
    });
});
