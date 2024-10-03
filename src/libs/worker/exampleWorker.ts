import Timing from '@libs/actions/Timing';
import * as FilterListUtils from '@libs/FilterListUtils';
import type {FilterOptionsConfig, Options} from '@libs/OptionsListUtils';
import CONST from '@src/CONST';
import {expose} from './index.web';

const worker = expose((options: Options, searchInputValue: string, config?: FilterOptionsConfig) => {
    Timing.start(CONST.TIMING.SEARCH_FILTER_OPTIONS);
    const performanceStart = performance.now();

    const res = FilterListUtils.filterOptions(options, searchInputValue, config);

    const performanceEnd = performance.now();
    Timing.end(CONST.TIMING.SEARCH_FILTER_OPTIONS);
    console.log(`[hanno] worker finished filtering in ${performanceEnd - performanceStart}ms`);
    return res;
});

export default worker;
