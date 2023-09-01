import React from 'react';
import {View} from 'react-native';
import PropTypes from 'prop-types';
import ScreenWrapper from '../components/ScreenWrapper';
import HeaderWithBackButton from '../components/HeaderWithBackButton';
import Navigation from '../libs/Navigation/Navigation';
import useLocalize from '../hooks/useLocalize';
import styles from '../styles/styles';
import ReportActionItemImage from '../components/ReportActionItem/ReportActionItemImage';

const propTypes = {
    /** TransactionID associated with the receipt */
    transactionID: PropTypes.string.isRequired,

    /** The receipt object with its ID, source and filename */
    receipt: PropTypes.shape({
        source: PropTypes.string,
    }).isRequired,
};

function EditRequestReceiptPage({transactionID, receipt}) {
    const {translate} = useLocalize();

    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom={false}
            shouldEnableMaxHeight
        >
            <HeaderWithBackButton
                title={translate('common.receipt')}
                onBackButtonPress={Navigation.goBack}
            />
            <View style={styles.moneyRequestViewImage}>
                <ReportActionItemImage
                    thumbnail={receipt.source}
                    image={{image: receipt.source}}
                    enablePreviewModal
                />
            </View>
        </ScreenWrapper>
    );
}

EditRequestReceiptPage.propTypes = propTypes;
EditRequestReceiptPage.displayName = 'EditRequestReceiptPage';

export default EditRequestReceiptPage;
