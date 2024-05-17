import CONST from '@src/CONST';

export default function lineBreaksToSpaces(text: string = '') {
    return text.replace(CONST.REGEX.LINE_BREAK, ' ');
}
