import {Str} from 'expensify-common';

type ValueToMap = {
    code?: string;
    id?: string;
    text?: string;
};

function mapToPushRowWithModalListOptions(values: ValueToMap[]): Record<string, string> {
    return values.reduce((acc, curr) => {
        if (curr.code && curr.text) {
            acc[curr.code] = Str.recapitalize(curr.text);
        }
        return acc;
    }, {} as Record<string, string>);
}

export default mapToPushRowWithModalListOptions;
