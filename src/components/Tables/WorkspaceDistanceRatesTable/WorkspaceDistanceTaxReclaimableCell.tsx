/** Keeps the editable tax amount separate from its formatted currency display. */
import {InlineNumberEditCell} from '@components/EditableCell';
import type {EditableProps} from '@components/EditableCell';

import useLocalize from '@hooks/useLocalize';

import {getTaxClaimableDisplayAmount} from '@libs/PolicyDistanceRatesUtils';

import CONST from '@src/CONST';
import type {Rate} from '@src/types/onyx/Policy';

import React from 'react';

type WorkspaceDistanceTaxReclaimableCellProps = {
    rate: Rate;
    displayText: string;
} & EditableProps<string>;

function WorkspaceDistanceTaxReclaimableCell({rate, displayText, canEdit, onSave}: WorkspaceDistanceTaxReclaimableCellProps) {
    const {translate} = useLocalize();
    const value = rate.attributes?.taxClaimablePercentage && rate.rate ? getTaxClaimableDisplayAmount(rate.attributes.taxClaimablePercentage, rate.rate) : '';

    return (
        <InlineNumberEditCell
            value={value}
            currency={rate.currency ?? CONST.CURRENCY.USD}
            displayText={displayText}
            decimals={CONST.MAX_TAX_RATE_DECIMAL_PLACES}
            textAlign="left"
            accessibilityLabel={translate('workspace.taxes.taxReclaimableOn')}
            canEdit={canEdit}
            onSave={onSave}
        />
    );
}

export default WorkspaceDistanceTaxReclaimableCell;
