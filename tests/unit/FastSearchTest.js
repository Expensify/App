"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var FastSearch_1 = require("../../src/libs/FastSearch");
describe('FastSearch', function () {
    it('should insert, and find the word', function () {
        var search = FastSearch_1.default.createFastSearch([
            {
                data: ['banana'],
                toSearchableString: function (data) { return data; },
            },
        ]).search;
        expect(search('an')).toEqual([['banana']]);
    });
    it('should work with multiple words', function () {
        var search = FastSearch_1.default.createFastSearch([
            {
                data: ['banana', 'test'],
                toSearchableString: function (data) { return data; },
            },
        ]).search;
        expect(search('es')).toEqual([['test']]);
    });
    it('should work when providing two data sets', function () {
        var search = FastSearch_1.default.createFastSearch([
            {
                data: ['erica', 'banana'],
                toSearchableString: function (data) { return data; },
            },
            {
                data: ['banana', 'test'],
                toSearchableString: function (data) { return data; },
            },
        ]).search;
        expect(search('es')).toEqual([[], ['test']]);
    });
    it('should work with numbers', function () {
        var search = FastSearch_1.default.createFastSearch([
            {
                data: [1, 2, 3, 4, 5],
                toSearchableString: function (data) { return String(data); },
            },
        ]).search;
        expect(search('2')).toEqual([[2]]);
    });
    it('should work with unicodes', function () {
        var search = FastSearch_1.default.createFastSearch([
            {
                data: ['banana', 'ñèşťǒř', 'test'],
                toSearchableString: function (data) { return data; },
            },
        ]).search;
        expect(search('èşť')).toEqual([['ñèşťǒř']]);
    });
    it('should work with words containing "reserved special characters"', function () {
        var search = FastSearch_1.default.createFastSearch([
            {
                data: ['ba|nana', 'te{st', 'he}llo'],
                toSearchableString: function (data) { return data; },
            },
        ]).search;
        expect(search('st')).toEqual([['te{st']]);
        expect(search('llo')).toEqual([['he}llo']]);
        expect(search('nana')).toEqual([['ba|nana']]);
    });
    it('should be case insensitive', function () {
        var search = FastSearch_1.default.createFastSearch([
            {
                data: ['banana', 'TeSt', 'TEST', 'X'],
                toSearchableString: function (data) { return data; },
            },
        ]).search;
        expect(search('test')).toEqual([['TeSt', 'TEST']]);
    });
    it('should work with large random data sets', function () {
        var data = Array.from({ length: 1000 }, function () {
            // We generate very large search strings that breaks the assumption of a certain average search value length.
            // This will cause a resizing of the underlying buffer, which we want to test here as well.
            return Array.from({ length: Math.floor(Math.random() * 100 + 9) }, function () {
                var alphabet = 'abcdefghijklmnopqrstuvwxyz0123456789@-_.';
                return alphabet.charAt(Math.floor(Math.random() * alphabet.length));
            }).join('');
        });
        var search = FastSearch_1.default.createFastSearch([
            {
                data: data,
                toSearchableString: function (x) { return x; },
            },
        ]).search;
        data.forEach(function (word) {
            expect(search(word)).toEqual([expect.arrayContaining([word])]);
        });
    });
    it('should find email addresses without dots', function () {
        var search = FastSearch_1.default.createFastSearch([
            {
                data: ['test.user@example.com', 'unrelated'],
                toSearchableString: function (data) { return data; },
            },
        ]).search;
        expect(search('testuser')).toEqual([['test.user@example.com']]);
        expect(search('test.user')).toEqual([['test.user@example.com']]);
        expect(search('examplecom')).toEqual([['test.user@example.com']]);
    });
    it('should filter duplicate IDs', function () {
        var search = FastSearch_1.default.createFastSearch([
            {
                data: [
                    {
                        text: 'qa.guide@team.expensify.com',
                        alternateText: 'qa.guide@team.expensify.com',
                        keyForList: '14365522',
                        isSelected: false,
                        isDisabled: false,
                        accountID: 14365522,
                        login: 'qa.guide@team.expensify.com',
                        icons: [
                            {
                                source: 'https://d2k5nsl2zxldvw.cloudfront.net/images/avatars/default-avatar_11.png',
                                type: 'avatar',
                                name: 'qa.guide@team.expensify.com',
                                id: 14365522,
                            },
                        ],
                        reportID: '',
                    },
                    {
                        text: 'qa.guide@team.expensify.com',
                        alternateText: 'qa.guide@team.expensify.com',
                        keyForList: '714749267',
                        isSelected: false,
                        isDisabled: false,
                        accountID: 714749267,
                        login: 'qa.guide@team.expensify.com',
                        icons: [
                            {
                                source: 'ƒ SvgFallbackAvatar(props)',
                                type: 'avatar',
                                name: 'qa.guide@team.expensify.com',
                                id: 714749267,
                            },
                        ],
                        reportID: '',
                    },
                ],
                toSearchableString: function (data) { return data.text; },
                uniqueId: function (data) { return data.login; },
            },
        ]).search;
        var result = search('qa.g')[0];
        // The both items are represented using the same string.
        expect(result).toHaveLength(1);
    });
});
