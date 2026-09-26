import {InlineNumberEditCell} from '@components/EditableCell';
import type {EditableProps} from '@components/EditableCell';

import useLocalize from '@hooks/useLocalize';

import {parseFloatAnyLocale} from '@libs/NumberUtils';

import CONST from '@src/CONST';
import type {Rate} from '@src/types/onyx/Policy';

import React from 'react';

type WorkspaceDistanceRateValueCellProps = {
    rate: Rate;
    displayText: string;
} & EditableProps<string>;

const areLocaleNumericValuesEqual = (newValue: string, originalValue: string) => parseFloatAnyLocale(newValue) === parseFloatAnyLocale(originalValue);

function WorkspaceDistanceRateValueCell({rate, displayText, canEdit, onSave}: WorkspaceDistanceRateValueCellProps) {
    const {translate} = useLocalize();
    const currency = rate.currency ?? CONST.CURRENCY.USD;
    const rateValue = (parseFloat((rate.rate ?? 0).toString()) / CONST.POLICY.CUSTOM_UNIT_RATE_BASE_OFFSET).toFixed(CONST.MAX_TAX_RATE_DECIMAL_PLACES);

    return (
        <InlineNumberEditCell
            value={rateValue}
            currency={currency}
            displayText={displayText}
            decimals={CONST.MAX_TAX_RATE_DECIMAL_PLACES}
            textAlign="left"
            isEqual={areLocaleNumericValuesEqual}
            accessibilityLabel={translate('workspace.distanceRates.rate')}
            canEdit={canEdit}
            onSave={onSave}
        />
    );
}

export default WorkspaceDistanceRateValueCell;
