import {useIsFocused} from '@react-navigation/native';
import lodashGet from 'lodash/get';
import PropTypes from 'prop-types';
import React from 'react';
import {withOnyx} from 'react-native-onyx';
import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
import transactionPropTypes from '@components/transactionPropTypes';
import getComponentDisplayName from '@libs/getComponentDisplayName';
import ONYXKEYS from '@src/ONYXKEYS';
import IOURequestStepRoutePropTypes from './IOURequestStepRoutePropTypes';

const propTypes = {
    /** The HOC takes an optional ref as a prop and passes it as a ref to the wrapped component.
     * That way, if a ref is passed to a component wrapped in the HOC, the ref is a reference to the wrapped component, not the HOC. */
    forwardedRef: PropTypes.func,

    /** The report corresponding to the reportID in the route params */
    transaction: transactionPropTypes,

    route: IOURequestStepRoutePropTypes.isRequired,
};

const defaultProps = {
    forwardedRef: () => {},
    transaction: {},
};

export default function (WrappedComponent) {
    // eslint-disable-next-line rulesdir/no-negated-variables
    function WithFullTransactionOrNotFound({forwardedRef, ...props}) {
        const {
            transaction: {transactionID},
        } = props;

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
                {...props}
                ref={forwardedRef}
            />
        );
    }

    WithFullTransactionOrNotFound.propTypes = propTypes;
    WithFullTransactionOrNotFound.defaultProps = defaultProps;
    WithFullTransactionOrNotFound.displayName = `withFullTransactionOrNotFound(${getComponentDisplayName(WrappedComponent)})`;

    // eslint-disable-next-line rulesdir/no-negated-variables
    const WithFullTransactionOrNotFoundWithRef = React.forwardRef((props, ref) => (
        <WithFullTransactionOrNotFound
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
            forwardedRef={ref}
        />
    ));

    WithFullTransactionOrNotFoundWithRef.displayName = 'WithFullTransactionOrNotFoundWithRef';

    return withOnyx({
        transaction: {
            key: ({route}) => `${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${lodashGet(route, 'params.transactionID', 0)}`,
        },
    })(WithFullTransactionOrNotFoundWithRef);
}
