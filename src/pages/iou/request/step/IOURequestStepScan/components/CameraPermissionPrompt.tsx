import React from 'react';
import {View} from 'react-native';
import Button from '@components/Button';
import ImageSVG from '@components/ImageSVG';
import ScrollView from '@components/ScrollView';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import CONST from '@src/CONST';
import type IconAsset from '@src/types/utils/IconAsset';

type CameraPermissionPromptProps = {
    /** Whether the device is currently in landscape orientation */
    isInLandscapeMode: boolean;

    /** The hand illustration asset shown to prompt for camera access */
    handIllustration: IconAsset | undefined;

    /** Callback fired when the continue button is pressed */
    onPress: () => void;
};

function CameraPermissionPrompt({isInLandscapeMode, handIllustration, onPress}: CameraPermissionPromptProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    return (
        <ScrollView contentContainerStyle={styles.flexGrow1}>
            <View style={[styles.cameraView, isInLandscapeMode ? styles.permissionViewLandscape : styles.permissionView, styles.userSelectNone]}>
                <ImageSVG
                    contentFit="contain"
                    src={handIllustration}
                    width={CONST.RECEIPT.HAND_ICON_WIDTH}
                    height={CONST.RECEIPT.HAND_ICON_HEIGHT}
                    style={styles.pb5}
                />

                <Text style={[styles.textFileUpload]}>{translate('receipt.takePhoto')}</Text>
                <Text style={[styles.subTextFileUpload]}>{translate('receipt.cameraAccess')}</Text>
                <Button
                    success
                    text={translate('common.continue')}
                    accessibilityLabel={translate('common.continue')}
                    style={[styles.p9, styles.pt5]}
                    onPress={onPress}
                    sentryLabel={CONST.SENTRY_LABEL.IOU_REQUEST_STEP.SCAN_SUBMIT_BUTTON}
                />
            </View>
        </ScrollView>
    );
}

export default CameraPermissionPrompt;
