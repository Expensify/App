import lodashClamp from 'lodash/clamp';
import React, {PureComponent} from 'react';
import {View} from 'react-native';
import PropTypes from 'prop-types';
import ImageWithSizeCalculation from './ImageWithSizeCalculation';
import addEncryptedAuthTokenToURL from '../libs/addEncryptedAuthTokenToURL';
import styles from '../styles/styles';
import * as StyleUtils from '../styles/StyleUtils';

const propTypes = {
    /** Source URL for the preview image */
    previewSourceURL: PropTypes.string.isRequired,

    /** Any additional styles to apply */
    // eslint-disable-next-line react/forbid-prop-types
    style: PropTypes.any,

    /** Do the urls require an authToken? */
    isAuthTokenRequired: PropTypes.bool.isRequired,
};

const defaultProps = {
    style: {},
};

class ThumbnailImage extends PureComponent {
    constructor(props) {
        super(props);

        this.updateImageSize = this.updateImageSize.bind(this);

        this.state = {
            thumbnailWidth: 200,
            thumbnailHeight: 200,
        };
    }

    updateImageSize({width, height}) {
        // Width of the thumbnail works better as a constant than it does
        // a percentage of the screen width since it is relative to each screen
        // Note: Clamp minimum width 40px to support touch device
        const thumbnailScreenWidth = lodashClamp(width, 40, 250);
        const scaleFactor = width / thumbnailScreenWidth;
        const imageHeight = height / scaleFactor;
        this.setState({thumbnailWidth: thumbnailScreenWidth, thumbnailHeight: imageHeight});
    }

    render() {
        const url = this.props.isAuthTokenRequired
            ? addEncryptedAuthTokenToURL(this.props.previewSourceURL)
            : this.props.previewSourceURL;

        return (
            <View
                style={[
                    StyleUtils.getWidthAndHeightStyle(this.state.thumbnailWidth, this.state.thumbnailHeight),
                    styles.alignItemsCenter,
                    styles.justifyContentCenter,
                    styles.overflowHidden,
                ]}
            >
                <ImageWithSizeCalculation
                    style={this.props.style}
                    url={url}
                    onMeasure={this.updateImageSize}
                />
            </View>
        );
    }
}

ThumbnailImage.propTypes = propTypes;
ThumbnailImage.defaultProps = defaultProps;
export default ThumbnailImage;
