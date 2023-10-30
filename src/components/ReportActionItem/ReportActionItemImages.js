import React from 'react';
import {View} from 'react-native';
import PropTypes from 'prop-types';
import _ from 'underscore';
import styles from '../../styles/styles';
import Text from '../Text';
import ReportActionItemImage from './ReportActionItemImage';
import * as StyleUtils from '../../styles/StyleUtils';
import variables from '../../styles/variables';
import transactionPropTypes from '../transactionPropTypes';

const propTypes = {
    /** array of image and thumbnail URIs */
    images: PropTypes.arrayOf(
        PropTypes.shape({
            thumbnail: PropTypes.string,
            image: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
            transaction: transactionPropTypes,
        }),
    ).isRequired,

    // We're not providing default values for size and total and disabling the ESLint rule
    // because we want them to default to the length of images, but we can't set default props
    // to be computed from another prop

    /** max number of images to show in the row if different than images length */
    // eslint-disable-next-line react/require-default-props
    size: PropTypes.number,

    /** total number of images if different than images length */
    // eslint-disable-next-line react/require-default-props
    total: PropTypes.number,

    /** if the corresponding report action item is hovered */
    isHovered: PropTypes.bool,
};

const defaultProps = {
    isHovered: false,
};

/**
 * This component displays a row of images in a report action item like a card, such
 * as report previews or money request previews which contain receipt images. The maximum of images
 * shown in this row is dictated by the size prop, which, if not passed, is just the number of images.
 * Otherwise, if size is passed and the number of images is over size, we show a small overlay on the
 * last image of how many additional images there are. If passed, total prop can be used to change how this
 * additional number when subtracted from size.
 */

function ReportActionItemImages({images, size, total, isHovered}) {
    // Calculate the number of images to be shown, limited by the value of 'size' (if defined)
    // or the total number of images.
    const numberOfShownImages = Math.min(size || images.length, images.length);
    const shownImages = images.slice(0, numberOfShownImages);
    const remaining = (total || images.length) - size;
    const MAX_REMAINING = 9;

    // The height varies depending on the number of images we are displaying.
    let heightStyle = {};
    if (numberOfShownImages === 1) {
        heightStyle = StyleUtils.getHeight(variables.reportActionImagesSingleImageHeight);
    } else if (numberOfShownImages === 2) {
        heightStyle = StyleUtils.getHeight(variables.reportActionImagesDoubleImageHeight);
    } else if (numberOfShownImages > 2) {
        heightStyle = StyleUtils.getHeight(variables.reportActionImagesMultipleImageHeight);
    }

    const hoverStyle = isHovered ? styles.reportPreviewBoxHoverBorder : undefined;

    return (
        <View style={[styles.reportActionItemImages, hoverStyle, heightStyle]}>
            {_.map(shownImages, ({thumbnail, image, transaction}, index) => {
                const isLastImage = index === numberOfShownImages - 1;

                // Show a border to separate multiple images. Shown to the right for each except the last.
                const shouldShowBorder = shownImages.length > 1 && index < shownImages.length - 1;
                const borderStyle = shouldShowBorder ? styles.reportActionItemImageBorder : {};
                return (
                    <View
                        key={`${index}-${image}`}
                        style={[styles.reportActionItemImage, borderStyle, hoverStyle]}
                    >
                        <ReportActionItemImage
                            thumbnail={thumbnail}
                            image={image}
                            transaction={transaction}
                        />
                        {isLastImage && remaining > 0 && (
                            <View style={[styles.reportActionItemImagesMoreContainer]}>
                                <View style={[styles.reportActionItemImagesMore, isHovered ? styles.reportActionItemImagesMoreHovered : {}]} />
                                <View style={[styles.reportActionItemImagesMoreCornerTriangle, isHovered ? styles.reportActionItemImagesMoreCornerTriangleHighlighted : {}]} />
                                <Text style={[styles.reportActionItemImagesMoreText, styles.textStrong]}>{remaining > MAX_REMAINING ? `${MAX_REMAINING}+` : `+${remaining}`}</Text>
                            </View>
                        )}
                    </View>
                );
            })}
        </View>
    );
}

ReportActionItemImages.propTypes = propTypes;
ReportActionItemImages.defaultProps = defaultProps;
ReportActionItemImages.displayName = 'ReportActionItemImages';

export default ReportActionItemImages;
