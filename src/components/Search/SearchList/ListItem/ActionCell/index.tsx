import React from 'react';
import Button from '@components/Button';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useThemeStyles from '@hooks/useThemeStyles';
import CONST from '@src/CONST';
import type {SearchTransactionAction} from '@src/types/onyx/SearchResults';
import actionTranslationsMap from './actionTranslationsMap';
import PayActionCell from './PayActionCell';

type ActionCellProps = {
    action?: SearchTransactionAction;
    isSelected?: boolean;
    onButtonPress: () => void;
    isChildListItem?: boolean;
    isLoading?: boolean;
    policyID?: string;
    reportID?: string;
    hash?: number;
    amount?: number;
    extraSmall?: boolean;
    shouldDisablePointerEvents?: boolean;
};

function ActionCell({
    action = CONST.SEARCH.ACTION_TYPES.VIEW,
    isSelected = false,
    onButtonPress,
    isChildListItem = false,
    isLoading = false,
    policyID = '',
    reportID = '',
    hash,
    amount,
    extraSmall = false,
    shouldDisablePointerEvents,
}: ActionCellProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const {isOffline} = useNetwork();

    const shouldUseViewAction = action === CONST.SEARCH.ACTION_TYPES.VIEW || action === CONST.SEARCH.ACTION_TYPES.PAID || action === CONST.SEARCH.ACTION_TYPES.DONE;

    if (shouldUseViewAction || (isChildListItem && action !== CONST.SEARCH.ACTION_TYPES.UNDELETE)) {
        const text = translate(actionTranslationsMap[CONST.SEARCH.ACTION_TYPES.VIEW]);
        const buttonInnerStyles = isSelected ? styles.buttonDefaultSelected : {};

        return (
            <Button
                testID="ActionCell"
                text={text}
                onPress={onButtonPress}
                small={!extraSmall}
                extraSmall={extraSmall}
                style={[styles.w100, shouldDisablePointerEvents && styles.pointerEventsNone]}
                isDisabled={shouldDisablePointerEvents}
                shouldStayNormalOnDisable={shouldDisablePointerEvents}
                innerStyles={buttonInnerStyles}
                link={isChildListItem}
                shouldUseDefaultHover={!isChildListItem}
                isNested
                sentryLabel={CONST.SENTRY_LABEL.SEARCH.ACTION_CELL_VIEW}
            />
        );
    }

    if (action === CONST.SEARCH.ACTION_TYPES.PAY) {
        return (
            <PayActionCell
                isLoading={isLoading}
                policyID={policyID}
                reportID={reportID}
                hash={hash}
                amount={amount}
                extraSmall={extraSmall}
                shouldDisablePointerEvents={shouldDisablePointerEvents}
            />
        );
    }

    const text = translate(actionTranslationsMap[action]);

    const shouldBeDisabledOffline = action !== CONST.SEARCH.ACTION_TYPES.UNDELETE && isOffline;
    const buttonInnerStyles = isSelected && action === CONST.SEARCH.ACTION_TYPES.UNDELETE ? styles.buttonDefaultSelected : {};

    return (
        <Button
            text={text}
            onPress={onButtonPress}
            small={!extraSmall}
            extraSmall={extraSmall}
            style={[styles.w100, shouldDisablePointerEvents && styles.pointerEventsNone]}
            isLoading={isLoading}
            success={action !== CONST.SEARCH.ACTION_TYPES.UNDELETE}
            isDisabled={shouldBeDisabledOffline || shouldDisablePointerEvents}
            shouldStayNormalOnDisable={shouldDisablePointerEvents}
            innerStyles={buttonInnerStyles}
            isNested
            sentryLabel={CONST.SENTRY_LABEL.SEARCH.ACTION_CELL_ACTION}
        />
    );
}

export type {ActionCellProps};
export default ActionCell;
