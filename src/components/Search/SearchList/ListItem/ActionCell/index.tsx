import Button from '@components/Button';

import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';

import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import type {ModifiedMouseEvent} from '@libs/Navigation/helpers/openInternalRouteInNewTab';
import {shouldShowMarkAsDone} from '@libs/ReportUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Report} from '@src/types/onyx';
import type {SearchTransactionAction} from '@src/types/onyx/SearchResults';

import type {OnyxEntry} from 'react-native-onyx';

import {isTrackIntentUserSelector} from '@selectors/Onboarding';
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
    extraSmall?: boolean;
    shouldDisablePointerEvents?: boolean;
    chatReport?: OnyxEntry<Report>;
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
    chatReport,
}: ActionCellProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const {isOffline} = useNetwork();
    const [isTrackIntentUser] = useOnyx(ONYXKEYS.NVP_INTRO_SELECTED, {selector: isTrackIntentUserSelector});
    const [actionCellPolicy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${getNonEmptyStringOnyxID(policyID)}`);
    const [actionCellReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${getNonEmptyStringOnyxID(reportID)}`);

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
                chatReport={chatReport}
            />
        );
    }

    const shouldUseMarkAsDone =
        shouldShowMarkAsDone({
            isTrackIntentUser,
            report: actionCellReport,
            policy: actionCellPolicy,
        }) && action === CONST.SEARCH.ACTION_TYPES.SUBMIT;
    const text = shouldUseMarkAsDone ? translate('common.done') : translate(actionTranslationsMap[action]);

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
