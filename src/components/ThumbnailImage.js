import PropTypes from 'prop-types';
import React, {useCallback, useState} from 'react';
import {View} from 'react-native';
import useThumbnailDimensions from '@hooks/useThumbnailDimensions';
import useThemeStyles from '@styles/useThemeStyles';
import ImageWithSizeCalculation from './ImageWithSizeCalculation';

const propTypes = {
    /** Source URL for the preview image */
    previewSourceURL: PropTypes.string.isRequired,

    /** Any additional styles to apply */
    // eslint-disable-next-line react/forbid-prop-types
    style: PropTypes.any,

    /** Whether the image requires an authToken */
    isAuthTokenRequired: PropTypes.bool.isRequired,

    /** Width of the thumbnail image */
    imageWidth: PropTypes.number,

    /** Height of the thumbnail image */
    imageHeight: PropTypes.number,

    /** Should the image be resized on load or just fit container */
    shouldDynamicallyResize: PropTypes.bool,
};

const defaultProps = {
    style: {},
    imageWidth: 200,
    imageHeight: 200,
    shouldDynamicallyResize: true,
};

function ThumbnailImage(props) {
    const styles = useThemeStyles();
    const [imageWidth, setImageWidth] = useState(props.imageWidth);
    const [imageHeight, setImageHeight] = useState(props.imageHeight);
    const {thumbnailDimensionsStyles} = useThumbnailDimensions(imageWidth, imageHeight);

    /**
     * Update the state with the computed thumbnail sizes.
     *
     * @param {{ width: number, height: number }} Params - width and height of the original image.
     */
    const updateImageSize = useCallback(
        ({width, height}) => {
            if (!props.shouldDynamicallyResize) {
                return;
            }
            setImageWidth(width);
            setImageHeight(height);
        },
        [props.shouldDynamicallyResize],
    );

    const sizeStyles = props.shouldDynamicallyResize ? [thumbnailDimensionsStyles] : [styles.w100, styles.h100];

    return (
        <View style={[props.style, styles.overflowHidden]}>
            <View style={[...sizeStyles, styles.alignItemsCenter, styles.justifyContentCenter]}>
                <ImageWithSizeCalculation
                    url={props.previewSourceURL}
                    onMeasure={updateImageSize}
                    isAuthTokenRequired={props.isAuthTokenRequired}
                />
            </View>
        </View>
    );
}

ThumbnailImage.propTypes = propTypes;
ThumbnailImage.defaultProps = defaultProps;
ThumbnailImage.displayName = 'ThumbnailImage';
export default React.memo(ThumbnailImage);
