import Button from '@components/ButtonComposed';

import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

import CONST from '@src/CONST';

import React, {useDeferredValue} from 'react';

import type {ActionCellProps} from '.';

import ActionCell from '.';
import actionTranslationsMap from './actionTranslationsMap';

function DeferredActionCell(actionCellProps: ActionCellProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const shouldRender = useDeferredValue(true, false);

    if (!shouldRender) {
        const action = actionCellProps.action ?? CONST.SEARCH.ACTION_TYPES.VIEW;
        const shouldUseViewAction = action === CONST.SEARCH.ACTION_TYPES.VIEW || action === CONST.SEARCH.ACTION_TYPES.PAID || action === CONST.SEARCH.ACTION_TYPES.DONE;
        const isSuccess = !shouldUseViewAction && action !== CONST.SEARCH.ACTION_TYPES.UNDELETE;
        let text: string;
        if (shouldUseViewAction) {
            text = translate(actionTranslationsMap[CONST.SEARCH.ACTION_TYPES.VIEW]);
        } else {
            text = actionCellProps.shouldShowMarkAsDoneCopy ? translate('common.done') : translate(actionTranslationsMap[action]);
        }

        return (
            <Button
                size={CONST.BUTTON_SIZE.SMALL}
                style={[styles.w100, styles.pointerEventsNone]}
                isDisabled
                variant={isSuccess ? CONST.BUTTON_VARIANT.SUCCESS : undefined}
                isNested
            >
                <Button.Text>{text}</Button.Text>
            </Button>
        );
    }

    // Deferred wrapper intentionally forwards all props to the underlying component

    return <ActionCell {...actionCellProps} />;
}

export default DeferredActionCell;
