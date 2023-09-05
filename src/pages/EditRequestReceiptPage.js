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

    /** The callback fired when we confirm to replace the receipt */
    onSubmit: PropTypes.func.isRequired,
}

function EditRequestReceiptPage({route, onSubmit}) {
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
            <DragAndDropProvider>
                <ReceiptSelector route={route} onSubmit={onSubmit} />
            </DragAndDropProvider>
        </ScreenWrapper>
    );
}

EditRequestReceiptPage.propTypes = propTypes;
EditRequestReceiptPage.displayName = 'EditRequestReceiptPage';

export default EditRequestReceiptPage;
