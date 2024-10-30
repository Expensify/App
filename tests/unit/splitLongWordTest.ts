import {splitLongWord} from '@components/InlineCodeBlock/WrappedText';

describe('splitLongWord', () => {
    const testCases = [
        {
            word: 'thissadasdasdsadsadasdadsadasdasdasdasdasdasdasdasdasdsadsadggggggggggggggggg',
            maxLength: 4,
            output: ['this', 'sada', 'sdas', 'dsad', 'sada', 'sdad', 'sada', 'sdas', 'dasd', 'asda', 'sdas', 'dasd', 'asda', 'sdsa', 'dsad', 'gggg', 'gggg', 'gggg', 'gggg', 'gggg', 'g'],
        },
        {
            word: 'https://www.google.com/search?q=google&oq=goog&gs_lcrp=EgZjaHJvbWUqEAgAEAAYgwEY4wIYsQMYgAQyEAgAEAAYgwEY4wIYsQMYgAQyEwgBEC4YgwEYxwEYsQMY0QMYgAQyDQgCEAAYgwEYsQMYgAQyBggDEEUYOzIGCAQQRRg8MgYIBRBFGDwyBggGEEUYPDIGCAcQBRhA0gEHNzM1ajBqN6gCALACAA&sourceid=chrome&ie=UTF-8',
            maxLength: 20,
            output: [
                'https://www.google.c',
                'om/search?q=google&o',
                'q=goog&gs_lcrp=EgZja',
                'HJvbWUqEAgAEAAYgwEY4',
                'wIYsQMYgAQyEAgAEAAYg',
                'wEY4wIYsQMYgAQyEwgBE',
                'C4YgwEYxwEYsQMY0QMYg',
                'AQyDQgCEAAYgwEYsQMYg',
                'AQyBggDEEUYOzIGCAQQR',
                'Rg8MgYIBRBFGDwyBggGE',
                'EUYPDIGCAcQBRhA0gEHN',
                'zM1ajBqN6gCALACAA&so',
                'urceid=chrome&ie=UTF',
                '-8',
            ],
        },
        {
            word: 'superkalifragilistischexpialigetisch',
            maxLength: 5,
            output: ['super', 'kalif', 'ragil', 'istis', 'chexp', 'ialig', 'etisc', 'h'],
        },
        {
            word: 'Este es un ejemplo de texto en español para la prueba',
            maxLength: 8,
            output: ['Este es ', 'un ejemp', 'lo de te', 'xto en e', 'spañol p', 'ara la p', 'rueba'],
        },
    ];

    testCases.forEach(({word, maxLength, output}) => {
        test(`should split ${word} into ${output.join()} with maxLength of ${maxLength}`, () => {
            expect(splitLongWord(word, maxLength)).toEqual(output);
        });
    });
});
