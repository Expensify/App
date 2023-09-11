import React, {useEffect} from 'react';
import PropTypes from 'prop-types';
import {View} from 'react-native';

import {withOnyx} from 'react-native-onyx';
import lodashGet from 'lodash/get';
import _ from 'underscore';
import ONYXKEYS from '../ONYXKEYS';
import CONST from '../CONST';
import * as MapboxToken from '../libs/actions/MapboxToken';
import * as TransactionUtils from '../libs/TransactionUtils';
import * as Expensicons from './Icon/Expensicons';
import theme from '../styles/themes/default';
import styles from '../styles/styles';
import transactionPropTypes from './transactionPropTypes';
import BlockingView from './BlockingViews/BlockingView';
import useNetwork from '../hooks/useNetwork';
import useLocalize from '../hooks/useLocalize';
import * as ReceiptUtils from '../libs/ReceiptUtils';
import Image from './Image';

const propTypes = {
    /** The transaction for the eReceipt */
    transaction: transactionPropTypes,
};

const defaultProps = {
    transaction: {},
};


function EReceipt({transaction}) {
    const {isOffline} = useNetwork();
    const {translate} = useLocalize();
    const {route0: route} = transaction.routes || {};

    const {thumbnail} = ReceiptUtils.getThumbnailAndImageURIs(transaction.receipt.source, transaction.filename);
    return (
        <>
            <View
                style={[styles.imageViewContainer, styles.overflowHidden]}
            >
                <Image
                    source={{uri: thumbnail}}
                    style={[styles.w100, styles.h100]}
                    resizeMode={Image.resizeMode.contain}
                    isAuthTokenRequired
                />
            </View>
        </>
    );
}

export default withOnyx({
    transaction: {
        key: ({transactionID}) => `${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`,
    },
})(EReceipt);

EReceipt.displayName = 'EReceipt';
EReceipt.propTypes = propTypes;
EReceipt.defaultProps = defaultProps;
