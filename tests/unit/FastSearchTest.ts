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
                data: ['banana', 'TeSt', 'TEST'],
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
});
