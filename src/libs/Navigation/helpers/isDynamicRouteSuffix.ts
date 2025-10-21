import {DYNAMIC_ROUTES} from '@src/ROUTES';
import type {DynamicRouteSuffix} from '@src/ROUTES';

function isDynamicRouteSuffix(suffix: DynamicRouteSuffix): boolean {
    const dynamicRouteSuffixes = Object.values(DYNAMIC_ROUTES).map((route) => route.path);
    return dynamicRouteSuffixes.includes(suffix);
}

export default isDynamicRouteSuffix;
