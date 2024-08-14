import * as FilterListUtils from '@libs/FilterListUtils';
import type {FilterOptionsConfig, Options} from '@libs/OptionsListUtils';
import {expose} from './index.web';

const worker = expose((options: Options, searchInputValue: string, config?: FilterOptionsConfig) => {
    const performanceStart = performance.now();

    const res = FilterListUtils.filterOptions(options, searchInputValue, config);
    const performanceEnd = performance.now();
    console.log(`[hanno] worker finished filtering in ${performanceEnd - performanceStart}ms`);
    return res;
});

export default worker;
