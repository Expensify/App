import lodashIsEmpty from 'lodash/isEmpty';
import lodashIsEqualWith from 'lodash/isEqualWith';
import React, {useEffect} from 'react';
import {withOnyx} from 'react-native-onyx';
import usePrevious from '@hooks/usePrevious';
import * as ReportActionsUtils from '@libs/ReportActionsUtils';
import * as Report from '@userActions/Report';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Transaction} from '@src/types/onyx';
import MoneyRequestPreviewContent from './MoneyRequestPreviewContent';
import type {MoneyRequestPreviewOnyxProps, MoneyRequestPreviewProps} from './types';

function MoneyRequestPreview(props: MoneyRequestPreviewProps) {
    const previousTransaction = usePrevious(props.transaction);

    useEffect(() => {
        if (lodashIsEmpty(props.iouReport) && !props.isBillSplit && lodashIsEmpty(props.transaction) && lodashIsEqualWith(previousTransaction, props.transaction)) {
            return;
        }
        // Check for previous/current transaction changes, skipping the empty ones.
        // @ts-expect-error - Object.keys requires `object` type and if we pass that
        // @typescript-eslint/ban-types errors telling us to use `Record<string, T>` type instead.
        const changedFields = Object.keys(props.transaction).filter(
            (key) =>
                !lodashIsEqualWith(props.transaction?.[key as keyof Transaction], previousTransaction?.[key as keyof Transaction], (previousValue, currentValue) => {
                    const isNumber = typeof previousValue === 'number' && typeof currentValue === 'number';
                    // We treat empty values as equal, bypassing the equality check (excluding numeric values)
                    if (!isNumber && lodashIsEmpty(previousValue) && lodashIsEmpty(currentValue)) {
                        return true;
                    }
                    // For all other values return undefined -> defaulting to isEqual check
                    return undefined;
                }),
        );

        // When transaction fields change from the BE via puser event (another device)
        // call OpenReport to actualize `report.lastReadTime` so that
        // `shouldDisplayNewMarker` function evaluates correctly.
        // See issue: https://github.com/Expensify/App/issues/36399
        if (!lodashIsEmpty(changedFields)) {
            Report.openReport(props.reportID);
        }
    }, [props.reportID, props.iouReport, props.isBillSplit, props.transaction, previousTransaction]);

    // We should not render the component if there is no iouReport and it's not a split.
    // Moved outside of the component scope to allow for easier use of hooks in the main component.
    // eslint-disable-next-line react/jsx-props-no-spreading
    return lodashIsEmpty(props.iouReport) && !props.isBillSplit ? null : <MoneyRequestPreviewContent {...props} />;
}

MoneyRequestPreview.displayName = 'MoneyRequestPreview';

export default withOnyx<MoneyRequestPreviewProps, MoneyRequestPreviewOnyxProps>({
    personalDetails: {
        key: ONYXKEYS.PERSONAL_DETAILS_LIST,
    },
    chatReport: {
        key: ({chatReportID}) => `${ONYXKEYS.COLLECTION.REPORT}${chatReportID}`,
    },
    iouReport: {
        key: ({iouReportID}) => `${ONYXKEYS.COLLECTION.REPORT}${iouReportID}`,
    },
    session: {
        key: ONYXKEYS.SESSION,
    },
    transaction: {
        key: ({action}) => {
            const isMoneyRequestAction = ReportActionsUtils.isMoneyRequestAction(action);
            const transactionID = isMoneyRequestAction ? action?.originalMessage?.IOUTransactionID : 0;
            return `${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`;
        },
    },
    walletTerms: {
        key: ONYXKEYS.WALLET_TERMS,
    },
    transactionViolations: {
        key: ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS,
    },
})(MoneyRequestPreview);
