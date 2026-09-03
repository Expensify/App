import {isRecord} from '@src/types/utils/ObjectUtils';

function getStringParam(params: unknown, key: string): string | undefined {
    if (!isRecord(params)) {
        return undefined;
    }
    const value = params[key];
    return typeof value === 'string' ? value : undefined;
}

export default getStringParam;
