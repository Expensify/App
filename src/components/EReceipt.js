import React from 'react';
import {View} from 'react-native';
import _ from 'underscore';
import styles from '../styles/styles';
import transactionPropTypes from './transactionPropTypes';
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
    const {thumbnail} = ReceiptUtils.getThumbnailAndImageURIs(transaction.receipt.source, transaction.filename);
    return (
        <>
            <View style={[styles.imageViewContainer, styles.overflowHidden]}>
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

export default EReceipt;
EReceipt.displayName = 'EReceipt';
EReceipt.propTypes = propTypes;
EReceipt.defaultProps = defaultProps;
