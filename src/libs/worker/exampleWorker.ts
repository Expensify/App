import * as FilterListUtils from '@libs/FilterListUtils';
import type {FilterOptionsConfig, Options} from '@libs/OptionsListUtils';
import initOnyx from '@src/setup/initOnyx';
import {expose} from './index.web';

// TODO: do this automatically per worker? But not every worker needs onyx - hm.
initOnyx();

const worker = expose((options: Options, searchInputValue: string, config?: FilterOptionsConfig) => {
    const performanceStart = performance.now();

    // inlinerequire
    const res = FilterListUtils.filterOptions(options, searchInputValue, config);
    const performanceEnd = performance.now();
    console.log(`[hanno] worker finished filtering in ${performanceEnd - performanceStart}ms`);
    return res;
});

export default worker;
