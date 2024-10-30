import { splitLongWord } from "@components/InlineCodeBlock/WrappedText";

describe('splitLongWord', () => {
    const testCases = [
        { 
            word: 'thissadasdasdsadsadasdadsadasdasdasdasdasdasdasdasdasdsadsadggggggggggggggggg', 
            maxLength: 4, 
            output: ['this', 'sada', 'sdas', 'dsad', 'sada', 'sdad', 'sada', 'sdas', 'dasd', 'asda', 'sdas', 'dasd', 'sads', 'adsa', 'dggg', 'gggg', 'gggg', 'gggg', 'gggg'] 
        },
        { 
            word: 'https://www.google.com/search?q=google&oq=goog&gs_lcrp=EgZjaHJvbWUqEAgAEAAYgwEY4wIYsQMYgAQyEAgAEAAYgwEY4wIYsQMYgAQyEwgBEC4YgwEYxwEYsQMY0QMYgAQyDQgCEAAYgwEYsQMYgAQyBggDEEUYOzIGCAQQRRg8MgYIBRBFGDwyBggGEEUYPDIGCAcQBRhA0gEHNzM1ajBqN6gCALACAA&sourceid=chrome&ie=UTF-8',
            maxLength: 20, 
            output: ['https://www.google.c', 'om/search?q=google', '&oq=goog&gs_lcrp', '=EgZjaHJvbWUqEAg', 'AEAAYgwEY4wIYsQM', 'YgAQyEAgAEAAYgwE', 'Y4wIYsQMYgAQyEw', 'gBEC4YgwEYxwEYs', 'QMY0QMYgAQyDQgc', 'EAAYgwEYsQMYgAQ', 'yBggDEEUYOzIGCA', 'QQRRg8MgYIBRBFG', 'DwyBggGEEUYPDIG', 'CAcQBRhA0gEHNzM', '1ajBqN6gCALACAA', '&sourceid=chrome&ie', '=UTF-8']
        },
        { 
            word: 'superkalifragilistischexpialigetisch', 
            maxLength: 5, 
            output: ['super', 'kali', 'fragi', 'listi', 'schex', 'piali', 'getis', 'ch'] 
        },
        { 
            word: 'Este es un ejemplo de texto en español para la prueba',
            maxLength: 8,
            output: ['Este es ', 'un ejemp', 'lo de te', 'xto en e', 'spañol p', 'ara la p', 'rueba']
        },
    ];

    testCases.forEach(({ word, maxLength, output }) => {
        test(`should split ${word} into ${output.join()} with maxLength of ${maxLength}`, () => {
            expect(splitLongWord(word, maxLength)).toEqual(output);
        });
    });
});