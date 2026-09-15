import React from 'react';

import type {MoneyRequestConfirmationListProps} from './types';

import DefaultConfirmationList from './variants/DefaultConfirmationList';

/**
 * Selects the confirmation list variant for the expense type being confirmed.
 *
 * Every type still reaches `DefaultConfirmationList`. As each per-type variant is extracted it gets a branch
 * here, keyed the same way the footer variants are keyed — on the request type and the action, since a type
 * confirmed outside its own flow (per diem moved off a track expense, say) confirms as a plain expense.
 */
function MoneyRequestConfirmationList(props: MoneyRequestConfirmationListProps) {
    return <DefaultConfirmationList {...props} />;
}

export default MoneyRequestConfirmationList;
