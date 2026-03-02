import React from 'react';
import {View} from 'react-native';
import RenderHTML from '@components/RenderHTML';
import {useActionsLocalize} from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

function UnsupportedDeviceDescription() {
    const styles = useThemeStyles();
    const {translate} = useActionsLocalize();

    return (
        <View style={[styles.renderHTML]}>
            <RenderHTML html={translate('multifactorAuthentication.unsupportedDevice.pleaseDownloadMobileApp')} />
        </View>
    );
}

UnsupportedDeviceDescription.displayName = 'UnsupportedDeviceDescription';

export default UnsupportedDeviceDescription;
