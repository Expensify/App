import PropTypes from 'prop-types';
import React, {useState} from 'react';
import {View} from 'react-native';
import DragAndDropProvider from '@components/DragAndDrop/Provider';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import IOURequestStepScan from './iou/request/step/IOURequestStepScan';

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
};

function EditRequestReceiptPage({route}) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const [isDraggingOver, setIsDraggingOver] = useState(false);

    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom={false}
            shouldEnableMaxHeight
            testID={EditRequestReceiptPage.displayName}
            headerGapStyles={isDraggingOver ? [styles.receiptDropHeaderGap] : []}
        >
            {({safeAreaPaddingBottomStyle}) => (
                <DragAndDropProvider setIsDraggingOver={setIsDraggingOver}>
                    <View style={[styles.flex1, safeAreaPaddingBottomStyle]}>
                        <HeaderWithBackButton
                            title={translate('common.receipt')}
                            onBackButtonPress={Navigation.goBack}
                        />
                        <IOURequestStepScan route={route} />
                    </View>
                </DragAndDropProvider>
            )}
        </ScreenWrapper>
    );
}

EditRequestReceiptPage.propTypes = propTypes;
EditRequestReceiptPage.displayName = 'EditRequestReceiptPage';

export default EditRequestReceiptPage;
