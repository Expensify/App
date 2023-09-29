import React from 'react';
import {withOnyx} from 'react-native-onyx';
import lodashGet from 'lodash/get';
import PropTypes from 'prop-types';
import useLocalize from '../../../../hooks/useLocalize';
import CONST from '../../../../CONST';
import ONYXKEYS from '../../../../ONYXKEYS';
import transactionPropTypes from '../../../../components/transactionPropTypes';

const propTypes = {
    /** React Navigation route */
    route: PropTypes.shape({
        /** Params from the route */
        params: PropTypes.shape({
            /** The type of IOU report, i.e. bill, request, send */
            iouType: PropTypes.string,

            /** The report ID of the IOU */
            reportID: PropTypes.string,
        }),
    }).isRequired,

    /* Onyx Props */
    /** The transaction object being modified in Onyx */
    transaction: transactionPropTypes,
};
const defaultProps = {};
function IOURequestStepConfirmation() {
    const {translate} = useLocalize();
}

IOURequestStepConfirmation.propTypes = propTypes;
IOURequestStepConfirmation.defaultProps = defaultProps;
IOURequestStepConfirmation.displayName = 'IOURequestStepConfirmation';

export default withOnyx({
    transaction: {
        key: ({route}) => `${ONYXKEYS.COLLECTION.TRANSACTION}${lodashGet(route, 'params.transactionID')}`,
    },
})(IOURequestStepConfirmation);
