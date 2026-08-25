import Button from '@components/ButtonComposed';
import LinkButton from '@components/ButtonComposed/composed/LinkButton';

import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useThemeStyles from '@hooks/useThemeStyles';

import type {ModifiedMouseEvent} from '@libs/Navigation/helpers/openInternalRouteInNewTab';

import CONST from '@src/CONST';
import type {Report} from '@src/types/onyx';
import type {SearchTransactionAction} from '@src/types/onyx/SearchResults';

import type {OnyxEntry} from 'react-native-onyx';

import React from 'react';

import actionTranslationsMap from './actionTranslationsMap';
import PayActionCell from './PayActionCell';

type ActionCellProps = {
    action?: SearchTransactionAction;
    isSelected?: boolean;
    onButtonPress: (event?: ModifiedMouseEvent) => void;
    isChildListItem?: boolean;
    isLoading?: boolean;
    policyID?: string;
    reportID?: string;
    hash?: number;
    amount?: number;
    shouldDisablePointerEvents?: boolean;
    chatReport?: OnyxEntry<Report>;
    /** Whether a SUBMIT action should render the "Mark as done" copy instead of "Submit" (see shouldShowMarkAsDone) */
    shouldShowMarkAsDoneCopy?: boolean;
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
    shouldDisablePointerEvents,
    chatReport,
    shouldShowMarkAsDoneCopy = false,
}: ActionCellProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const {isOffline} = useNetwork();

    const shouldUseViewAction = action === CONST.SEARCH.ACTION_TYPES.VIEW || action === CONST.SEARCH.ACTION_TYPES.PAID || action === CONST.SEARCH.ACTION_TYPES.DONE;

    if (shouldUseViewAction || (isChildListItem && action !== CONST.SEARCH.ACTION_TYPES.UNDELETE)) {
        const text = translate(actionTranslationsMap[CONST.SEARCH.ACTION_TYPES.VIEW]);
        const buttonInnerStyles = isSelected && styles.buttonDefaultSelected;
        const ViewButton = isChildListItem ? LinkButton : Button;

        return (
            <ViewButton
                testID="ActionCell"
                onPress={onButtonPress}
                size={CONST.BUTTON_SIZE.SMALL}
                style={[styles.w100, shouldDisablePointerEvents && styles.pointerEventsNone]}
                isDisabled={shouldDisablePointerEvents}
                stayNormalOnDisable={shouldDisablePointerEvents}
                innerStyles={buttonInnerStyles}
                isNested
                sentryLabel={CONST.SENTRY_LABEL.SEARCH.ACTION_CELL_VIEW}
            >
                <ViewButton.Text>{text}</ViewButton.Text>
            </ViewButton>
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
                shouldDisablePointerEvents={shouldDisablePointerEvents}
                chatReport={chatReport}
            />
        );
    }

    const text = shouldShowMarkAsDoneCopy && action === CONST.SEARCH.ACTION_TYPES.SUBMIT ? translate('common.done') : translate(actionTranslationsMap[action]);

    const shouldBeDisabledOffline = action !== CONST.SEARCH.ACTION_TYPES.UNDELETE && isOffline;
    const buttonInnerStyles = isSelected && action === CONST.SEARCH.ACTION_TYPES.UNDELETE && styles.buttonDefaultSelected;

    return (
        <Button
            onPress={onButtonPress}
            size={CONST.BUTTON_SIZE.SMALL}
            style={[styles.w100, shouldDisablePointerEvents && styles.pointerEventsNone]}
            isLoading={isLoading}
            variant={action !== CONST.SEARCH.ACTION_TYPES.UNDELETE ? CONST.BUTTON_VARIANT.SUCCESS : undefined}
            isDisabled={shouldBeDisabledOffline || shouldDisablePointerEvents}
            stayNormalOnDisable={shouldDisablePointerEvents}
            innerStyles={buttonInnerStyles}
            isNested
            sentryLabel={CONST.SENTRY_LABEL.SEARCH.ACTION_CELL_ACTION}
        >
            <Button.Text>{text}</Button.Text>
        </Button>
    );
}

export type {ActionCellProps};
export default ActionCell;
