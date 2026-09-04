import {useConfirmationFields} from '@components/MoneyRequestConfirmationFields/context';

import CONST from '@src/CONST';

import React from 'react';

import type {MoneyRequestConfirmationListFooterProps} from './types';

import DefaultFooter from './variants/DefaultFooter';
import PerDiemFooter from './variants/PerDiemFooter';
import TimeFooter from './variants/TimeFooter';

/**
 * Selects the footer variant for the expense type being confirmed. Types that have not been extracted yet
 * fall back to `DefaultFooter`, which renders exactly what the single footer component rendered before the split.
 */
function MoneyRequestConfirmationListFooter(props: MoneyRequestConfirmationListFooterProps) {
    const {action, isPerDiemRequest, isTimeRequest} = useConfirmationFields();

    if (isPerDiemRequest && action !== CONST.IOU.ACTION.SUBMIT) {
        return <PerDiemFooter {...props} />;
    }

    if (isTimeRequest && action === CONST.IOU.ACTION.CREATE) {
        return <TimeFooter {...props} />;
    }

    return <DefaultFooter {...props} />;
}

export default MoneyRequestConfirmationListFooter;
