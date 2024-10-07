import React from 'react';
import {Image, View} from 'react-native';
import useThemeStyles from '@hooks/useThemeStyles';

type AttachmentPreviewProps = {uri: string | undefined; aspectRatio: number | undefined};

function AttachmentPreview({uri, aspectRatio}: AttachmentPreviewProps) {
    // const theme = useTheme();
    const styles = useThemeStyles();
    // const {isOffline} = useNetwork();
    // const {translate} = useLocalize();

    return (
        <View
            style={{
                width: '100%',
                aspectRatio,
                justifyContent: 'center',
                alignItems: 'center',
            }}
        >
            <Image
                source={{uri}}
                style={[styles.h100, styles.w100, styles.br2]}
                resizeMode="cover"
            />
        </View>
    );
}

AttachmentPreview.displayName = 'AttachmentPreview';

export default AttachmentPreview;
