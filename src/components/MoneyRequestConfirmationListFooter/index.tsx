import React from 'react';

import type {MoneyRequestConfirmationListFooterProps} from './types';

import DefaultFooter from './variants/DefaultFooter';

/**
 * Selects the footer variant for the expense type being confirmed. Until
 * every type has variant, everything routes to `DefaultFooter`, which renders exactly what the single
 * footer component rendered before the split.
 */
function MoneyRequestConfirmationListFooter(props: MoneyRequestConfirmationListFooterProps) {
    return <DefaultFooter {...props} />;
}

export default MoneyRequestConfirmationListFooter;
