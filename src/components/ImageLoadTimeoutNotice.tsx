import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

import CONST from '@src/CONST';

import React from 'react';
import {View} from 'react-native';

import Button from './Button';
import Text from './Text';

type ImageLoadTimeoutNoticeProps = {
    /** Re-runs the image load */
    onRetry: () => void;
};

/** Replaces the spinner once a load stalls. The image stays mounted, so a slow load still finishes and clears this. */
function ImageLoadTimeoutNotice({onRetry}: ImageLoadTimeoutNoticeProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const icons = useMemoizedLazyExpensifyIcons(['ArrowCircleClockwise']);

    return (
        <View
            testID="image-load-timeout-notice"
            style={[styles.pAbsolute, styles.w100, styles.h100, styles.alignItemsCenter, styles.justifyContentCenter, styles.gap2]}
        >
            <Text style={[styles.textSupporting, styles.textAlignCenter]}>{translate('attachmentView.loadTimedOut')}</Text>
            <Button
                size={CONST.BUTTON_SIZE.SMALL}
                onPress={onRetry}
                sentryLabel={CONST.SENTRY_LABEL.IMAGE_LOAD.RETRY_BUTTON}
            >
                <Button.Icon src={icons.ArrowCircleClockwise} />
                <Button.Text>{translate('attachmentView.retry')}</Button.Text>
            </Button>
        </View>
    );
}

ImageLoadTimeoutNotice.displayName = 'ImageLoadTimeoutNotice';

export default ImageLoadTimeoutNotice;
