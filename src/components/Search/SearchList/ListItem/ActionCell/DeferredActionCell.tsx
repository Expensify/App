import React, {useDeferredValue} from 'react';
import Button from '@components/Button';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import CONST from '@src/CONST';
import ActionCell from '.';
import type {ActionCellProps} from '.';
import actionTranslationsMap from './actionTranslationsMap';

function DeferredActionCell(actionCellProps: ActionCellProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const shouldRender = useDeferredValue(true, false);

    if (!shouldRender) {
        const action = actionCellProps.action ?? CONST.SEARCH.ACTION_TYPES.VIEW;
        const shouldUseViewAction = action === CONST.SEARCH.ACTION_TYPES.VIEW || action === CONST.SEARCH.ACTION_TYPES.PAID || action === CONST.SEARCH.ACTION_TYPES.DONE;
        const isSuccess = !shouldUseViewAction && action !== CONST.SEARCH.ACTION_TYPES.UNDELETE;
        const text = shouldUseViewAction ? translate(actionTranslationsMap[CONST.SEARCH.ACTION_TYPES.VIEW]) : translate(actionTranslationsMap[action]);

        return (
            <Button
                text={text}
                small={!actionCellProps.extraSmall}
                extraSmall={actionCellProps.extraSmall}
                style={[styles.w100, styles.pointerEventsNone]}
                isDisabled
                success={isSuccess}
                isNested
            />
        );
    }

    // Deferred wrapper intentionally forwards all props to the underlying component
    // eslint-disable-next-line react/jsx-props-no-spreading
    return <ActionCell {...actionCellProps} />;
}

export default DeferredActionCell;
