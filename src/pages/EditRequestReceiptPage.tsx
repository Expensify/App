import React, {useState} from 'react';
import {View} from 'react-native';
import DragAndDropProvider from '@components/DragAndDrop/Provider';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import IOURequestStepScan from './iou/request/step/IOURequestStepScan';
import type IOURequestStepProps from './iou/request/step/IOURequestStepScan/types';

function EditRequestReceiptPage({route}: IOURequestStepProps) {
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
                        <IOURequestStepScan
                            // @ts-expect-error HOCs which are used in the component aren't migrated to TS
                            route={route}
                        />
                    </View>
                </DragAndDropProvider>
            )}
        </ScreenWrapper>
    );
}

EditRequestReceiptPage.displayName = 'EditRequestReceiptPage';

export default EditRequestReceiptPage;
