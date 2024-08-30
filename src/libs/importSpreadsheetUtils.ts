import CONST from '@src/CONST';

function findDuplicate(array: string[]): string | null {
    const frequencyCounter: Record<string, number> = {};

    for (const item of array) {
        if (item !== CONST.CSV_IMPORT_COLUMNS.IGNORE) {
            if (frequencyCounter[item]) {
                return item;
            }
            frequencyCounter[item] = (frequencyCounter[item] || 0) + 1;
        }
    }

    return null;
}

function numberToColumn(index: number) {
    let column = '';
    let number = index;
    while (number >= 0) {
        column = String.fromCharCode((number % 26) + 65) + column;
        number = Math.floor(number / 26) - 1;
    }
    return column;
}

function generateColumnNames(length: number) {
    return Array.from({length}, (_, i) => numberToColumn(i));
}

export {findDuplicate, generateColumnNames};
