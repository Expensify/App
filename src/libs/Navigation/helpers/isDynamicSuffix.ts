import {DYNAMIC_ROUTES} from '@src/ROUTES';
import type {DynamicRouteSuffix} from '@src/ROUTES';

function isDynamicSuffix(suffix: DynamicRouteSuffix): boolean {
    const dynamicSuffixes = Object.values(DYNAMIC_ROUTES);
    return dynamicSuffixes.includes(suffix);
}

export default isDynamicSuffix;
