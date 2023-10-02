import React from 'react';
import PropTypes from 'prop-types';
import ScreenWrapper from '../components/ScreenWrapper';
import HeaderWithBackButton from '../components/HeaderWithBackButton';
import Navigation from '../libs/Navigation/Navigation';
import useLocalize from '../hooks/useLocalize';
import ReceiptSelector from './iou/ReceiptSelector';
import DragAndDropProvider from '../components/DragAndDrop/Provider';

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

    /** The id of the transaction we're editing */
    transactionID: PropTypes.string,
};

const defaultProps = {
    transactionID: '',
};

function EditRequestReceiptPage({route, transactionID}) {
    const {translate} = useLocalize();

    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom={false}
            shouldEnableMaxHeight
            testID={EditRequestReceiptPage.displayName}
        >
            <HeaderWithBackButton
                title={translate('common.receipt')}
                onBackButtonPress={Navigation.goBack}
            />
            <DragAndDropProvider>
                <ReceiptSelector
                    route={route}
                    transactionID={transactionID}
                    isInTabNavigator={false}
                />
            </DragAndDropProvider>
        </ScreenWrapper>
    );
}

EditRequestReceiptPage.propTypes = propTypes;
EditRequestReceiptPage.defaultProps = defaultProps;
EditRequestReceiptPage.displayName = 'EditRequestReceiptPage';

export default EditRequestReceiptPage;
