import FileUtils, {ERROR_MESSAGES} from '@scripts/utils/FileUtils';

const multiLineSource = `abc
hello
world
test
multi
line
content`;

describe('FileUtils (Scripts)', () => {
    describe('getLineAndColumnFromIndex', () => {
        it('should return correct line and column for multi-line source', () => {
            expect(FileUtils.getLineAndColumnFromIndex(multiLineSource, 0)).toStrictEqual({line: 1, column: 1});
            expect(FileUtils.getLineAndColumnFromIndex(multiLineSource, 3)).toStrictEqual({line: 1, column: 4});
            expect(FileUtils.getLineAndColumnFromIndex(multiLineSource, 4)).toStrictEqual({line: 2, column: 1});
            expect(FileUtils.getLineAndColumnFromIndex(multiLineSource, 10)).toStrictEqual({line: 3, column: 1});
            expect(FileUtils.getLineAndColumnFromIndex(multiLineSource, multiLineSource.length)).toStrictEqual({line: 7, column: 8});
        });

        it('should throw an error if source is empty', () => {
            expect(() => FileUtils.getLineAndColumnFromIndex('', 0)).toThrow(ERROR_MESSAGES.SOURCE_CANNOT_BE_EMPTY);
        });

        it('should throw an error if index is negative', () => {
            expect(() => FileUtils.getLineAndColumnFromIndex(multiLineSource, -1)).toThrow(ERROR_MESSAGES.INDEX_CANNOT_BE_NEGATIVE);
        });

        it('should throw an error if index is out of bounds', () => {
            expect(() => FileUtils.getLineAndColumnFromIndex(multiLineSource, multiLineSource.length + 10)).toThrow(
                ERROR_MESSAGES.INDEX_OUT_OF_BOUNDS(multiLineSource.length, multiLineSource.length + 10),
            );
        });
    });
});
