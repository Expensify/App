import AmountFilterContent from '@components/Search/FilterComponents/AdvancedFilters/AmountFilterContent';
import type {AmountFilterContentWrapperProps} from '@components/Search/FilterComponents/AdvancedFilters/SearchAdvancedFiltersContent';

import CONST from '@src/CONST';

import React from 'react';

function AmountFilterContentPageWrapper({baseFilterKey, buttonText, value, onChange}: AmountFilterContentWrapperProps) {
    return (
        <AmountFilterContent
            baseFilterKey={baseFilterKey}
            value={value}
            buttonSize={CONST.BUTTON_SIZE.LARGE}
            autoFocus
            buttonText={buttonText}
            sentryLabel={CONST.SENTRY_LABEL.SEARCH.FILTER_SAVE_BUTTON}
            onChange={onChange}
        />
    );
}

export default AmountFilterContentPageWrapper;
