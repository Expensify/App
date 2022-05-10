import lodashClamp from 'lodash/clamp';
import React, {PureComponent} from 'react';
import {View} from 'react-native';
import PropTypes from 'prop-types';
import ImageWithSizeCalculation from './ImageWithSizeCalculation';
import addEncryptedAuthTokenToURL from '../libs/addEncryptedAuthTokenToURL';
import styles from '../styles/styles';
import * as StyleUtils from '../styles/StyleUtils';
import withWindowDimensions, {windowDimensionsPropTypes} from './withWindowDimensions';

const propTypes = {
    /** Source URL for the preview image */
    previewSourceURL: PropTypes.string.isRequired,

    /** Any additional styles to apply */
    // eslint-disable-next-line react/forbid-prop-types
    style: PropTypes.any,

    /** Do the urls require an authToken? */
    isAuthTokenRequired: PropTypes.bool.isRequired,

    /** Image size */
    imageWidth: PropTypes.number,
    imageHeight: PropTypes.number,

    ...windowDimensionsPropTypes,
};

const defaultProps = {
    style: {},
    imageWidth: 200,
    imageHeight: 200,
};

class ThumbnailImage extends PureComponent {
    constructor(props) {
        super(props);

        this.updateImageSize = this.updateImageSize.bind(this);
        const {width, height} = this.calculateThumbnailImageSize(props.imageWidth, props.imageHeight);
        this.state = {
            thumbnailWidth: width,
            thumbnailHeight: height,
        };
    }

    calculateThumbnailImageSize(width, height) {
        if (!width || !height) { return {}; }

        // Width of the thumbnail works better as a constant than it does
        // a percentage of the screen width since it is relative to each screen
        // Note: Clamp minimum width 40px to support touch device
        let thumbnailScreenWidth = lodashClamp(width, 40, 250);
        const imageHeight = height / (width / thumbnailScreenWidth);
        let thumbnailScreenHeight = lodashClamp(imageHeight, 40, this.props.windowHeight * 0.40);
        const aspectRatio = height / width;

        // If thumbnail height is greater than its width, then the image is portrait otherwise landscape.
        // For portrait images, we need to adjust the width of the image to keep the aspect ratio and vice-versa.
        if (thumbnailScreenHeight > thumbnailScreenWidth) {
            thumbnailScreenWidth = Math.round(thumbnailScreenHeight * (1 / aspectRatio));
        } else {
            thumbnailScreenHeight = Math.round(thumbnailScreenWidth * aspectRatio);
        }
        return {width: thumbnailScreenWidth, height: thumbnailScreenHeight};
    }

    updateImageSize({width, height}) {
        const {width: thumbnailScreenWidth, height: thumbnailScreenHeight} = this.calculateThumbnailImageSize(width, height);
        this.setState({thumbnailWidth: thumbnailScreenWidth, thumbnailHeight: Math.max(40, thumbnailScreenHeight)});
    }

    render() {
        const url = this.props.isAuthTokenRequired
            ? addEncryptedAuthTokenToURL(this.props.previewSourceURL)
            : this.props.previewSourceURL;

        return (
            <View style={[this.props.style, styles.overflowHidden]}>
                <View
                    style={[
                        StyleUtils.getWidthAndHeightStyle(this.state.thumbnailWidth, this.state.thumbnailHeight),
                        styles.alignItemsCenter,
                        styles.justifyContentCenter,
                    ]}
                >
                    <ImageWithSizeCalculation
                        url={url}
                        onMeasure={this.updateImageSize}
                    />
                </View>
            </View>
        );
    }
}

ThumbnailImage.propTypes = propTypes;
ThumbnailImage.defaultProps = defaultProps;
export default withWindowDimensions(ThumbnailImage);
