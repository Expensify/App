import {isTrackIntentUserSelector} from '@selectors/Onboarding';
import React, {useDeferredValue} from 'react';
import Button from '@components/Button';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import {shouldShowMarkAsDone} from '@libs/ReportUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ActionCell from '.';
import type {ActionCellProps} from '.';
import actionTranslationsMap from './actionTranslationsMap';

function DeferredActionCell(actionCellProps: ActionCellProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const shouldRender = useDeferredValue(true, false);
    const [isTrackIntentUser] = useOnyx(ONYXKEYS.NVP_INTRO_SELECTED, {selector: isTrackIntentUserSelector});
    const [actionCellPolicy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${getNonEmptyStringOnyxID(actionCellProps.policyID)}`);
    const [actionCellReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${getNonEmptyStringOnyxID(actionCellProps.reportID)}`);

    if (!shouldRender) {
        const action = actionCellProps.action ?? CONST.SEARCH.ACTION_TYPES.VIEW;
        const shouldUseViewAction = action === CONST.SEARCH.ACTION_TYPES.VIEW || action === CONST.SEARCH.ACTION_TYPES.PAID || action === CONST.SEARCH.ACTION_TYPES.DONE;
        const isSuccess = !shouldUseViewAction && action !== CONST.SEARCH.ACTION_TYPES.UNDELETE;
        let text: string;
        if (shouldUseViewAction) {
            text = translate(actionTranslationsMap[CONST.SEARCH.ACTION_TYPES.VIEW]);
        } else {
            const shouldUseMarkAsDone =
                shouldShowMarkAsDone({
                    isTrackIntentUser,
                    report: actionCellReport,
                    policy: actionCellPolicy,
                }) && action === CONST.SEARCH.ACTION_TYPES.SUBMIT;

            text = shouldUseMarkAsDone ? translate('common.done') : translate(actionTranslationsMap[action]);
        }

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

    return <ActionCell {...actionCellProps} />;
}

export default DeferredActionCell;
