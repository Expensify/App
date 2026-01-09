import {useIsFocused} from '@react-navigation/native';
import type {ComponentType} from 'react';
import React from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
import FullScreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import useOnyx from '@hooks/useOnyx';
import getComponentDisplayName from '@libs/getComponentDisplayName';
import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import {shouldUseTransactionDraft} from '@libs/IOUUtils';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {MoneyRequestNavigatorParamList} from '@libs/Navigation/types';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';
import type {Transaction} from '@src/types/onyx';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';

type WithFullTransactionOrNotFoundOnyxProps = {
    /** Indicates whether the report data is loading */
    transaction: OnyxEntry<Transaction>;

    /** Indicates whether the transaction data is loading */
    isLoadingTransaction?: boolean;
};

type MoneyRequestRouteName =
    | typeof SCREENS.MONEY_REQUEST.CREATE
    | typeof SCREENS.MONEY_REQUEST.STEP_DISTANCE
    | typeof SCREENS.MONEY_REQUEST.STEP_AMOUNT
    | typeof SCREENS.MONEY_REQUEST.STEP_WAYPOINT
    | typeof SCREENS.MONEY_REQUEST.STEP_DESCRIPTION
    | typeof SCREENS.MONEY_REQUEST.STEP_DATE
    | typeof SCREENS.MONEY_REQUEST.STEP_TAX_AMOUNT
    | typeof SCREENS.MONEY_REQUEST.STEP_PARTICIPANTS
    | typeof SCREENS.MONEY_REQUEST.STEP_MERCHANT
    | typeof SCREENS.MONEY_REQUEST.STEP_TAG
    | typeof SCREENS.MONEY_REQUEST.STEP_DISTANCE_RATE
    | typeof SCREENS.MONEY_REQUEST.STEP_CONFIRMATION
    | typeof SCREENS.MONEY_REQUEST.STEP_CATEGORY
    | typeof SCREENS.MONEY_REQUEST.STEP_TAX_RATE
    | typeof SCREENS.MONEY_REQUEST.STEP_SCAN
    | typeof SCREENS.MONEY_REQUEST.STEP_SEND_FROM
    | typeof SCREENS.MONEY_REQUEST.STEP_REPORT
    | typeof SCREENS.MONEY_REQUEST.STEP_COMPANY_INFO
    | typeof SCREENS.MONEY_REQUEST.STEP_DESTINATION
    | typeof SCREENS.MONEY_REQUEST.STEP_TIME
    | typeof SCREENS.MONEY_REQUEST.STEP_TIME_EDIT
    | typeof SCREENS.MONEY_REQUEST.STEP_SUBRATE
    | typeof SCREENS.MONEY_REQUEST.STEP_DISTANCE_MAP
    | typeof SCREENS.MONEY_REQUEST.STEP_DISTANCE_GPS
    | typeof SCREENS.MONEY_REQUEST.DISTANCE_CREATE
    | typeof SCREENS.MONEY_REQUEST.STEP_DISTANCE_MANUAL
    | typeof SCREENS.MONEY_REQUEST.STEP_DISTANCE_ODOMETER;

type WithFullTransactionOrNotFoundProps<RouteName extends MoneyRequestRouteName> = WithFullTransactionOrNotFoundOnyxProps &
    PlatformStackScreenProps<MoneyRequestNavigatorParamList, RouteName>;

export default function <TProps extends WithFullTransactionOrNotFoundProps<MoneyRequestRouteName>>(
    WrappedComponent: ComponentType<TProps>,
    shouldShowLoadingIndicator = false,
): React.ComponentType<Omit<TProps, keyof WithFullTransactionOrNotFoundOnyxProps>> {
    // eslint-disable-next-line rulesdir/no-negated-variables
    function WithFullTransactionOrNotFound(props: Omit<TProps, keyof WithFullTransactionOrNotFoundOnyxProps>) {
        const {route} = props;
        const transactionID = route.params.transactionID;
        const userAction = 'action' in route.params && route.params.action ? route.params.action : CONST.IOU.ACTION.CREATE;

        const [transaction, transactionResult] = useOnyx(`${ONYXKEYS.COLLECTION.TRANSACTION}${getNonEmptyStringOnyxID(transactionID)}`, {canBeMissing: true});
        const [transactionDraft, transactionDraftResult] = useOnyx(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${getNonEmptyStringOnyxID(transactionID)}`, {canBeMissing: true});
        const isLoadingTransaction = isLoadingOnyxValue(transactionResult, transactionDraftResult);

        const [splitTransactionDraft] = useOnyx(`${ONYXKEYS.COLLECTION.SPLIT_TRANSACTION_DRAFT}${getNonEmptyStringOnyxID(transactionID)}`, {canBeMissing: true});

        const userType = 'iouType' in route.params && route.params.iouType ? route.params.iouType : CONST.IOU.TYPE.CREATE;

        const isFocused = useIsFocused();

        const transactionDraftData = userType === CONST.IOU.TYPE.SPLIT_EXPENSE ? splitTransactionDraft : transactionDraft;

        // If the transaction does not have a transactionID, then the transaction no longer exists in Onyx as a full transaction and the not-found page should be shown.
        // In addition, the not-found page should be shown only if the component screen's route is active (i.e. is focused).
        // This is to prevent it from showing when the modal is being dismissed while navigating to a different route (e.g. on requesting money).
        if (!transactionID) {
            return <FullPageNotFoundView shouldShow={isFocused} />;
        }

        if (isLoadingTransaction && shouldShowLoadingIndicator) {
            return <FullScreenLoadingIndicator />;
        }
        return (
            <WrappedComponent
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...(props as TProps)}
                transaction={shouldUseTransactionDraft(userAction, userType) ? transactionDraftData : transaction}
                isLoadingTransaction={isLoadingTransaction}
            />
        );
    }

    WithFullTransactionOrNotFound.displayName = `withFullTransactionOrNotFound(${getComponentDisplayName(WrappedComponent)})`;

    return WithFullTransactionOrNotFound;
}

export type {WithFullTransactionOrNotFoundProps};
