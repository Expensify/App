import CONST from '@src/CONST';

export default function lineBreaksToSpaces(text = '') {
    return text.replace(CONST.REGEX.LINE_BREAK, ' ');
}
