import {InlineNumberEditCell} from '@components/EditableCell';
import type {EditableProps} from '@components/EditableCell';

import useLocalize from '@hooks/useLocalize';

import {convertToFrontendAmountAsString} from '@libs/CurrencyUtils';

import CONST from '@src/CONST';

import React from 'react';

type WorkspacePerDiemAmountCellProps = {
    /** Subrate amount in cents */
    rate: number;
    currency: string;
    displayText: string;
} & EditableProps<string>;

function WorkspacePerDiemAmountCell({rate, currency, displayText, canEdit, onSave}: WorkspacePerDiemAmountCellProps) {
    const {translate} = useLocalize();

    return (
        <InlineNumberEditCell
            value={convertToFrontendAmountAsString(rate, CONST.DEFAULT_CURRENCY_DECIMALS)}
            currency={currency}
            displayText={displayText}
            decimals={CONST.DEFAULT_CURRENCY_DECIMALS}
            allowNegativeInput
            accessibilityLabel={translate('workspace.perDiem.amount')}
            canEdit={canEdit}
            onSave={onSave}
        />
    );
}

export default WorkspacePerDiemAmountCell;
