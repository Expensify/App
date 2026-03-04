import React from 'react';
import Button from '@components/Button';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useThemeStyles from '@hooks/useThemeStyles';
import CONST from '@src/CONST';
import type {SearchTransactionAction} from '@src/types/onyx/SearchResults';
import actionTranslationsMap from './actionTranslationsMap';
import BadgeActionCell from './BadgeActionCell';
import PayActionCell from './PayActionCell';

type ActionCellProps = {
    action?: SearchTransactionAction;
    isLargeScreenWidth?: boolean;
    isSelected?: boolean;
    goToItem: () => void;
    isChildListItem?: boolean;
    parentAction?: string;
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
    isLargeScreenWidth = true,
    isSelected = false,
    goToItem,
    isChildListItem = false,
    parentAction = '',
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

    const shouldUseViewAction = action === CONST.SEARCH.ACTION_TYPES.VIEW || (parentAction === CONST.SEARCH.ACTION_TYPES.PAID && action === CONST.SEARCH.ACTION_TYPES.PAID);
    const isBadgeAction = !isChildListItem && ((parentAction !== CONST.SEARCH.ACTION_TYPES.PAID && action === CONST.SEARCH.ACTION_TYPES.PAID) || action === CONST.SEARCH.ACTION_TYPES.DONE);

    if (isBadgeAction) {
        return (
            <BadgeActionCell
                action={action}
                isLargeScreenWidth={isLargeScreenWidth}
                isSelected={isSelected}
                extraSmall={extraSmall}
                shouldDisablePointerEvents={shouldDisablePointerEvents}
            />
        );
    }

    if (action === CONST.SEARCH.ACTION_TYPES.VIEW || shouldUseViewAction || isChildListItem) {
        const text = isChildListItem ? translate(actionTranslationsMap[CONST.SEARCH.ACTION_TYPES.VIEW]) : translate(actionTranslationsMap[action]);
        const buttonInnerStyles = isSelected ? styles.buttonDefaultSelected : {};

        return isLargeScreenWidth ? (
            <Button
                testID="ActionCell"
                text={text}
                onPress={goToItem}
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
        ) : null;
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

    return (
        <Button
            text={text}
            onPress={goToItem}
            small={!extraSmall}
            extraSmall={extraSmall}
            style={[styles.w100, shouldDisablePointerEvents && styles.pointerEventsNone]}
            isLoading={isLoading}
            success
            isDisabled={isOffline || shouldDisablePointerEvents}
            shouldStayNormalOnDisable={shouldDisablePointerEvents}
            isNested
            sentryLabel={CONST.SENTRY_LABEL.SEARCH.ACTION_CELL_ACTION}
        />
    );
}

export type {ActionCellProps};
export default ActionCell;
