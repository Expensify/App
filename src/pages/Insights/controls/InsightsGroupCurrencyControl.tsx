import CurrencyPopup from '@components/Search/FilterDropdowns/CurrencyPopup';
import DropdownButton from '@components/Search/FilterDropdowns/DropdownButton';
import type {PopoverComponentProps} from '@components/Search/FilterDropdowns/FilterPopupButton';

import useLocalize from '@hooks/useLocalize';

import CONST from '@src/CONST';

import React from 'react';

import type {InsightsControlProps} from './insightsControls';

import INSIGHTS_CONTROL_ANCHOR_ALIGNMENT from './insightsControls';

function InsightsGroupCurrencyControl({value, onChange}: InsightsControlProps<string>) {
    const {translate} = useLocalize();
    const label = translate('common.groupCurrency');

    const currencyPopover = ({closeOverlay}: PopoverComponentProps) => (
        <CurrencyPopup
            label={label}
            value={value}
            defaultValue={value}
            searchPlaceholder={translate('common.search')}
            onChange={(item) => onChange(item?.value ?? value)}
            closeOverlay={closeOverlay}
        />
    );

    return (
        <DropdownButton
            label={label}
            value={value}
            sentryLabel={CONST.SENTRY_LABEL.INSIGHTS.CONTROL_GROUP_CURRENCY}
            popoverAnchorAlignment={INSIGHTS_CONTROL_ANCHOR_ALIGNMENT}
            PopoverComponent={currencyPopover}
        />
    );
}

export default InsightsGroupCurrencyControl;
