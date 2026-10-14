import {InlineNumberEditCell} from '@components/EditableCell';
import type {EditableProps} from '@components/EditableCell';

import useLocalize from '@hooks/useLocalize';

import {convertToFrontendAmountAsString} from '@libs/CurrencyUtils';

import CONST from '@src/CONST';

import React from 'react';

type WorkspaceExpensifyCardLimitCellProps = {
    /** Unapproved expense limit in cents */
    limit: number;
    currency?: string;
    displayText: string;
} & EditableProps<string>;

function WorkspaceExpensifyCardLimitCell({limit, currency = CONST.CURRENCY.USD, displayText, canEdit, onSave}: WorkspaceExpensifyCardLimitCellProps) {
    const {translate} = useLocalize();

    return (
        <InlineNumberEditCell
            value={convertToFrontendAmountAsString(limit, 0)}
            currency={currency}
            displayText={displayText}
            accessibilityLabel={translate('workspace.expensifyCard.limit')}
            canEdit={canEdit}
            onSave={onSave}
        />
    );
}

export default WorkspaceExpensifyCardLimitCell;
