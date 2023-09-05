import React from 'react';
import PropTypes from 'prop-types';
import ScreenWrapper from '../components/ScreenWrapper';
import HeaderWithBackButton from '../components/HeaderWithBackButton';
import Navigation from '../libs/Navigation/Navigation';
import useLocalize from '../hooks/useLocalize';
import ReceiptSelector from './iou/ReceiptSelector';
import CONST from '../CONST';
import DragAndDropProvider from '../components/DragAndDrop/Provider';

const propTypes = {
    /** The callback fired when we confirm to replace the receipt */
    onSubmit: PropTypes.func.isRequired,
}

function EditRequestReceiptPage() {
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
                <ReceiptSelector />
            </DragAndDropProvider>
        </ScreenWrapper>
    );
}

EditRequestReceiptPage.propTypes = propTypes;
EditRequestReceiptPage.displayName = 'EditRequestReceiptPage';

export default EditRequestReceiptPage;
