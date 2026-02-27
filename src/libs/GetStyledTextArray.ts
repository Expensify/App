import {Str} from 'expensify-common';
import StringUtils from './StringUtils';

type StyledText = {
    text: string;
    isColored: boolean;
};

const getStyledTextArray = (name: string, prefix: string): StyledText[] => {
    const texts = [];
    const prefixLowercase = prefix.toLowerCase();
    const prefixLocation = StringUtils.normalizeAccents(name)
        .toLowerCase()
        .search(Str.escapeForRegExp(StringUtils.normalizeAccents(prefixLowercase)));

    if (prefixLocation === 0 && prefix.length === name.length) {
        texts.push({text: name, isColored: true});
    } else if (prefixLocation === 0 && prefix.length !== name.length) {
        texts.push({text: name.slice(0, prefix.length), isColored: true}, {text: name.slice(prefix.length), isColored: false});
    } else if (prefixLocation > 0 && prefix.length !== name.length) {
        texts.push(
            {text: name.slice(0, prefixLocation), isColored: false},
            {
                text: name.slice(prefixLocation, prefixLocation + prefix.length),
                isColored: true,
            },
            {
                text: name.slice(prefixLocation + prefix.length),
                isColored: false,
            },
        );
    } else {
        texts.push({text: name, isColored: false});
    }
    return texts;
};

export default getStyledTextArray;
