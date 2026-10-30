import {InlineNumberEditCell} from '@components/EditableCell';
import type {EditableProps} from '@components/EditableCell';

import useLocalize from '@hooks/useLocalize';

import CONST from '@src/CONST';
import type {Rate} from '@src/types/onyx/Policy';

import type {ReactNode} from 'react';

import React from 'react';

type WorkspaceDistanceRateValueCellProps = {
    rate: Rate;
    displayText: string;

    /** Shown right after the rate text, like the auto-generated rate icon. */
    displayAccessory?: ReactNode;
} & EditableProps<string>;

function WorkspaceDistanceRateValueCell({rate, displayText, displayAccessory, canEdit, onSave}: WorkspaceDistanceRateValueCellProps) {
    const {translate} = useLocalize();
    const currency = rate.currency ?? CONST.CURRENCY.USD;
    const rateValue = (parseFloat((rate.rate ?? 0).toString()) / CONST.POLICY.CUSTOM_UNIT_RATE_BASE_OFFSET).toFixed(CONST.MAX_TAX_RATE_DECIMAL_PLACES);

    return (
        <InlineNumberEditCell
            value={rateValue}
            currency={currency}
            displayText={displayText}
            displayAccessory={displayAccessory}
            decimals={CONST.MAX_TAX_RATE_DECIMAL_PLACES}
            textAlign="left"
            accessibilityLabel={translate('workspace.distanceRates.rate')}
            canEdit={canEdit}
            onSave={onSave}
        />
    );
}

export default WorkspaceDistanceRateValueCell;
