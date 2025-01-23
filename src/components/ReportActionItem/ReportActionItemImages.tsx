/* eslint-disable react/no-array-index-key */
import {Str} from 'expensify-common';
import React from 'react';
import {View} from 'react-native';
import {Polygon, Svg} from 'react-native-svg';
import {ImageBehaviorContextProvider} from '@components/Image/ImageBehaviorContextProvider';
import Text from '@components/Text';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import type {ThumbnailAndImageURI} from '@libs/ReceiptUtils';
import variables from '@styles/variables';
import ReportActionItemImage from './ReportActionItemImage';

type ReportActionItemImagesProps = {
    /** array of image and thumbnail URIs */
    images: ThumbnailAndImageURI[];

    // We're not providing default values for size and total and disabling the ESLint rule
    // because we want them to default to the length of images, but we can't set default props
    // to be computed from another prop

    /** max number of images to show in the row if different than images length */
    size?: number;

    /** total number of images if different than images length */
    total?: number;

    /** if the corresponding report action item is hovered */
    isHovered?: boolean;

    /** Callback to be called on onPress */
    onPress?: () => void;
};

/**
 * This component displays a row of images in a report action item like a card, such
 * as report previews or expense previews which contain receipt images. The maximum of images
 * shown in this row is dictated by the size prop, which, if not passed, is just the number of images.
 * Otherwise, if size is passed and the number of images is over size, we show a small overlay on the
 * last image of how many additional images there are. If passed, total prop can be used to change how this
 * additional number when subtracted from size.
 */

function ReportActionItemImages({images, size, total, isHovered = false, onPress}: ReportActionItemImagesProps) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    // Calculate the number of images to be shown, limited by the value of 'size' (if defined)
    // or the total number of images.
    const numberOfShownImages = Math.min(size ?? images.length, images.length);
    const shownImages = images.slice(0, numberOfShownImages);
    const remaining = (total ?? images.length) - numberOfShownImages;
    const MAX_REMAINING = 9;

    // The height varies depending on the number of images we are displaying.
    let maxHeightStyle = {};
    let minHeightStyle = {};
    if (numberOfShownImages === 1) {
        maxHeightStyle = StyleUtils.getMaximumHeight(variables.reportActionImagesSingleImageHeight);
        minHeightStyle = StyleUtils.getMinimumHeight(variables.reportActionImagesSingleImageHeight);
    } else if (numberOfShownImages === 2) {
        maxHeightStyle = StyleUtils.getMaximumHeight(variables.reportActionImagesDoubleImageHeight);
        minHeightStyle = StyleUtils.getMinimumHeight(variables.reportActionImagesDoubleImageHeight);
    } else if (numberOfShownImages > 2) {
        maxHeightStyle = StyleUtils.getMaximumHeight(variables.reportActionImagesMultipleImageHeight);
        minHeightStyle = StyleUtils.getMinimumHeight(variables.reportActionImagesMultipleImageHeight);
    }

    const hoverStyle = isHovered ? styles.reportPreviewBoxHoverBorder : undefined;

    const triangleWidth = variables.reportActionItemImagesMoreCornerTriangleWidth;

    return (
        <View style={styles.reportActionItemImagesContainer}>
            <View style={[styles.reportActionItemImages, hoverStyle, minHeightStyle, maxHeightStyle]}>
                {shownImages.map(({thumbnail, isThumbnail, image, isEmptyReceipt, transaction, isLocalFile, fileExtension, filename}, index) => {
                    // Show a border to separate multiple images. Shown to the right for each except the last.
                    const shouldShowBorder = shownImages.length > 1 && index < shownImages.length - 1;
                    const borderStyle = shouldShowBorder ? styles.reportActionItemImageBorder : {};
                    return (
                        <ImageBehaviorContextProvider shouldSetAspectRatioInStyle={numberOfShownImages === 1 ? true : Str.isPDF(filename ?? '')}>
                            <View
                                key={`${index}-${image}`}
                                style={[styles.reportActionItemImage, borderStyle, hoverStyle]}
                            >
                                <ReportActionItemImage
                                    thumbnail={thumbnail}
                                    fileExtension={fileExtension}
                                    image={image}
                                    isLocalFile={isLocalFile}
                                    isEmptyReceipt={isEmptyReceipt}
                                    filename={filename}
                                    transaction={transaction}
                                    isThumbnail={isThumbnail}
                                    isSingleImage={numberOfShownImages === 1}
                                    shouldMapHaveBorderRadius={false}
                                    onPress={onPress}
                                />
                            </View>
                        </ImageBehaviorContextProvider>
                    );
                })}
            </View>
            {remaining > 0 && (
                <View style={[styles.reportActionItemImagesMoreContainer]}>
                    <View style={[styles.reportActionItemImagesMore, isHovered ? styles.reportActionItemImagesMoreHovered : {}]} />
                    <Svg
                        height={triangleWidth}
                        width={triangleWidth}
                        style={styles.reportActionItemImagesMoreCornerTriangle}
                    >
                        <Polygon
                            points={`${triangleWidth},0 ${triangleWidth},${triangleWidth} 0,${triangleWidth}`}
                            fill={isHovered ? theme.border : theme.cardBG}
                        />
                    </Svg>
                    <Text style={[styles.reportActionItemImagesMoreText, styles.textStrong]}>{remaining > MAX_REMAINING ? `${MAX_REMAINING}+` : `+${remaining}`}</Text>
                </View>
            )}
        </View>
    );
}

ReportActionItemImages.displayName = 'ReportActionItemImages';

export default ReportActionItemImages;
export type {ReportActionItemImagesProps};
