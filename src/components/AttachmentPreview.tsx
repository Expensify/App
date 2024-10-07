import React from 'react';
import {Image, View} from 'react-native';
import useThemeStyles from '@hooks/useThemeStyles';

type AttachmentPreviewProps = {uri: string};

function AttachmentPreview({uri}: AttachmentPreviewProps) {
    // const theme = useTheme();
    const styles = useThemeStyles();
    // const {isOffline} = useNetwork();
    // const {translate} = useLocalize();

    return (
        <View style={[styles.flex1, styles.flexRow]}>
            <Image
                source={{uri}}
                style={[styles.w100, styles.flexRow, {backgroundColor: 'red'}]}
            />
        </View>
    );
}

AttachmentPreview.displayName = 'AttachmentPreview';

export default AttachmentPreview;
