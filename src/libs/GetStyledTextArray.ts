import Str from 'expensify-common/lib/str';

type StyledText = {
    text: string;
    isColored: boolean;
};

const getStyledTextArray = (name: string, prefix: string): StyledText[] => {
    const texts = [];
    const prefixLowercase = prefix.toLowerCase();
    const prefixLocation = name.toLowerCase().search(Str.escapeForRegExp(prefixLowercase));

    if (prefixLocation === 0 && prefix.length === name.length) {
        texts.push({text: prefixLowercase, isColored: true});
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
