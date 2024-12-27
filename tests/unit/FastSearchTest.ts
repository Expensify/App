import FastSearch from '../../src/libs/FastSearch';

describe('FastSearch', () => {
    it('should insert, and find the word', () => {
        const {search} = FastSearch.createFastSearch([
            {
                data: ['banana'],
                toSearchableString: (data) => data,
            },
        ]);
        expect(search('an')).toEqual([['banana']]);
    });

    it('should work with multiple words', () => {
        const {search} = FastSearch.createFastSearch([
            {
                data: ['banana', 'test'],
                toSearchableString: (data) => data,
            },
        ]);

        expect(search('es')).toEqual([['test']]);
    });

    it('should work when providing two data sets', () => {
        const {search} = FastSearch.createFastSearch([
            {
                data: ['erica', 'banana'],
                toSearchableString: (data) => data,
            },
            {
                data: ['banana', 'test'],
                toSearchableString: (data) => data,
            },
        ]);

        expect(search('es')).toEqual([[], ['test']]);
    });

    it('should work with numbers', () => {
        const {search} = FastSearch.createFastSearch([
            {
                data: [1, 2, 3, 4, 5],
                toSearchableString: (data) => String(data),
            },
        ]);

        expect(search('2')).toEqual([[2]]);
    });

    it('should work with unicodes', () => {
        const {search} = FastSearch.createFastSearch([
            {
                data: ['banana', 'ñèşťǒř', 'test'],
                toSearchableString: (data) => data,
            },
        ]);

        expect(search('èşť')).toEqual([['ñèşťǒř']]);
    });

    it('should work with words containing "reserved special characters"', () => {
        const {search} = FastSearch.createFastSearch([
            {
                data: ['ba|nana', 'te{st', 'he}llo'],
                toSearchableString: (data) => data,
            },
        ]);

        expect(search('st')).toEqual([['te{st']]);
        expect(search('llo')).toEqual([['he}llo']]);
        expect(search('nana')).toEqual([['ba|nana']]);
    });

    it('should be case insensitive', () => {
        const {search} = FastSearch.createFastSearch([
            {
                data: ['banana', 'TeSt', 'TEST', 'X'],
                toSearchableString: (data) => data,
            },
        ]);

        expect(search('test')).toEqual([['TeSt', 'TEST']]);
    });

    it('should work with large random data sets', () => {
        const data = Array.from({length: 1000}, () => {
            return Array.from({length: Math.floor(Math.random() * 22 + 9)}, () => {
                const alphabet = 'abcdefghijklmnopqrstuvwxyz0123456789@-_.';
                return alphabet.charAt(Math.floor(Math.random() * alphabet.length));
            }).join('');
        });

        const {search} = FastSearch.createFastSearch([
            {
                data,
                toSearchableString: (x) => x,
            },
        ]);

        data.forEach((word) => {
            expect(search(word)).toEqual([expect.arrayContaining([word])]);
        });
    });

    it('should find email addresses without dots', () => {
        const {search} = FastSearch.createFastSearch([
            {
                data: ['test.user@example.com', 'unrelated'],
                toSearchableString: (data) => data,
            },
        ]);

        expect(search('testuser')).toEqual([['test.user@example.com']]);
        expect(search('test.user')).toEqual([['test.user@example.com']]);
        expect(search('examplecom')).toEqual([['test.user@example.com']]);
    });

    it('should filter duplicate IDs', () => {
        const {search} = FastSearch.createFastSearch([
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
                toSearchableString: (data) => data.text,
                uniqueId: (data) => data.login,
            },
        ]);

        const [result] = search('qa.g');
        // The both items are represented using the same string.
        expect(result).toHaveLength(1);
    });
});
