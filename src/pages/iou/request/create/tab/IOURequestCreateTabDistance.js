import React, {useRef} from 'react';
import {withOnyx} from 'react-native-onyx';
import ONYXKEYS from '../../../../../ONYXKEYS';
import transactionPropTypes from '../../../../../components/transactionPropTypes';
import IOURequestFieldDistance from '../../field/IOURequestFieldDistance';

const propTypes = {
    /* Onyx Props */
    /** The transaction object storing all the data for creation */
    transaction: transactionPropTypes,
};

const defaultProps = {
    transaction: {},
};

function IOURequestCreateTabDistance({transaction}) {
    return <IOURequestFieldDistance transactionID={transaction.transactionID} />;
}

IOURequestCreateTabDistance.propTypes = propTypes;
IOURequestCreateTabDistance.defaultProps = defaultProps;
IOURequestCreateTabDistance.displayName = 'IOURequestCreateTabDistance';

export default withOnyx({
    transaction: {
        key: `${ONYXKEYS.COLLECTION.TRANSACTION}new`,
    },
})(IOURequestCreateTabDistance);
