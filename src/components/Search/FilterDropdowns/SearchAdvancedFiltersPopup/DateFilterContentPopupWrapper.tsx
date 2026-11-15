import DateFilterContent from '@components/Search/FilterComponents/AdvancedFilters/DateFilterContent';
import type {DateFilterContentWrapperProps} from '@components/Search/FilterComponents/AdvancedFilters/SearchAdvancedFiltersContent';

import useThemeStyles from '@hooks/useThemeStyles';

import {hasKey} from '@libs/ObjectUtils';
import {FILTER_VIEW_MAP} from '@libs/SearchUIUtils';
import type {SearchDateModifier} from '@libs/SearchUIUtils';

import CONST from '@src/CONST';

import React, {useState} from 'react';
import {View} from 'react-native';

function DateFilterContentPopupWrapper({baseFilterKey, value, hasFeed, onChange}: DateFilterContentWrapperProps) {
    const styles = useThemeStyles();
    const [selectedDateModifier, setSelectedDateModifier] = useState<SearchDateModifier | null>(null);
    // Report field date filters have per-field keys, which aren't in FILTER_VIEW_MAP; they all apply as the report field filter.
    const applySentryLabel = hasKey(FILTER_VIEW_MAP, baseFilterKey) ? FILTER_VIEW_MAP[baseFilterKey].applySentryLabel : CONST.SENTRY_LABEL.SEARCH.FILTER_POPUP_APPLY.REPORT_FIELD;

    return (
        <View style={[styles.flex1, selectedDateModifier ? styles.pt2 : styles.pv2]}>
            <DateFilterContent
                baseFilterKey={baseFilterKey}
                value={value}
                hasFeed={hasFeed}
                selectedDateModifier={selectedDateModifier}
                style={[styles.flexShrink1]}
                sentryLabel={applySentryLabel}
                onDateModifierSelected={setSelectedDateModifier}
                onChange={onChange}
            />
        </View>
    );
}

export default DateFilterContentPopupWrapper;
