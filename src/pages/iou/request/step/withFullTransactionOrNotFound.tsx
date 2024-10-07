import type {RouteProp} from '@react-navigation/native';
import {useIsFocused} from '@react-navigation/native';
import type {ComponentType, ForwardedRef, RefAttributes} from 'react';
import React, {forwardRef, useMemo} from 'react';
import {useOnyx} from 'react-native-onyx';
import type {OnyxEntry} from 'react-native-onyx';
import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
import getComponentDisplayName from '@libs/getComponentDisplayName';
import * as IOUUtils from '@libs/IOUUtils';
import type {MoneyRequestNavigatorParamList} from '@libs/Navigation/types';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';
import type {Transaction} from '@src/types/onyx';

type WithFullTransactionOrNotFoundOnyxProps = {
    /** Indicates whether the report data is loading */
    transaction: OnyxEntry<Transaction>;
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
    | typeof SCREENS.MONEY_REQUEST.STEP_CURRENCY
    | typeof SCREENS.MONEY_REQUEST.STEP_SEND_FROM
    | typeof SCREENS.MONEY_REQUEST.STEP_COMPANY_INFO;

type Route<TRouteName extends MoneyRequestRouteName> = RouteProp<MoneyRequestNavigatorParamList, TRouteName>;

type WithFullTransactionOrNotFoundProps<TRouteName extends MoneyRequestRouteName> = WithFullTransactionOrNotFoundOnyxProps & {
    route: Route<TRouteName>;
};

export default function <TProps extends WithFullTransactionOrNotFoundProps<MoneyRequestRouteName>, TRef>(
    WrappedComponent: ComponentType<TProps & RefAttributes<TRef>>,
): React.ComponentType<Omit<TProps, keyof WithFullTransactionOrNotFoundOnyxProps> & RefAttributes<TRef>> {
    // eslint-disable-next-line rulesdir/no-negated-variables
    function WithFullTransactionOrNotFound(props: Omit<TProps, keyof WithFullTransactionOrNotFoundOnyxProps>, ref: ForwardedRef<TRef>) {
        const {route} = props;
        const transactionID = route.params.transactionID ?? -1;
        const userAction = 'action' in route.params && route.params.action ? route.params.action : CONST.IOU.ACTION.CREATE;

        const shouldUseTransactionDraft = IOUUtils.shouldUseTransactionDraft(userAction);

        const [transaction] = useOnyx(`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`);
        const [transactionDraft] = useOnyx(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${transactionID}`);

        const isFocused = useIsFocused();

        // If the transaction does not have a transactionID, then the transaction no longer exists in Onyx as a full transaction and the not-found page should be shown.
        // In addition, the not-found page should be shown only if the component screen's route is active (i.e. is focused).
        // This is to prevent it from showing when the modal is being dismissed while navigating to a different route (e.g. on requesting money).
        if (!transactionID) {
            return <FullPageNotFoundView shouldShow={isFocused} />;
        }

        return (
            <WrappedComponent
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...(props as TProps)}
                transaction={shouldUseTransactionDraft ? transactionDraft : transaction}
                ref={ref}
            />
        );
    }

    WithFullTransactionOrNotFound.displayName = `withFullTransactionOrNotFound(${getComponentDisplayName(WrappedComponent)})`;

    return forwardRef(WithFullTransactionOrNotFound);
}

export type {WithFullTransactionOrNotFoundProps};
