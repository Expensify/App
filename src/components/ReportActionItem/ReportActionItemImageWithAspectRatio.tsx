import React from 'react';
import {View} from 'react-native';
import {ImageBehaviorContextProvider} from '@components/Image/ImageBehaviorContextProvider';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';
import type {ThumbnailAndImageURI} from '@libs/ReceiptUtils';
import variables from '@styles/variables';
import ReportActionItemImage from './ReportActionItemImage';

type ReportActionItemImageWithAspectRatioProps = {
    /** Report action item image */
    image: ThumbnailAndImageURI;

    /** Whether we should use aspect ratio to decide the height of receipt previews. */
    shouldUseAspectRatio?: boolean;
};

function ReportActionItemImageWithAspectRatio({image, shouldUseAspectRatio = false}: ReportActionItemImageWithAspectRatioProps) {
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();

    const layoutStyle = [];
    if (shouldUseAspectRatio) {
        layoutStyle.push(styles.receiptPreviewAspectRatio);
    } else {
        layoutStyle.push(StyleUtils.getMaximumHeight(variables.reportActionImagesSingleImageHeight), StyleUtils.getMinimumHeight(variables.reportActionImagesSingleImageHeight));
    }

    return (
        <View style={styles.reportActionItemContainer}>
            <View style={layoutStyle}>
                <ImageBehaviorContextProvider
                    key={`${image.image}`}
                    shouldSetAspectRatioInStyle
                >
                    <View style={styles.reportActionItemImage}>
                        <ReportActionItemImage
                            /* eslint-disable-next-line react/jsx-props-no-spreading */
                            {...image}
                            shouldMapHaveBorderRadius={false}
                            shouldUseFullHeight={shouldUseAspectRatio}
                        />
                    </View>
                </ImageBehaviorContextProvider>
            </View>
        </View>
    );
}

export default ReportActionItemImageWithAspectRatio;
export type {ReportActionItemImageWithAspectRatioProps};
