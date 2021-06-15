import React, {PureComponent} from 'react';
import {View} from 'react-native';
import PropTypes from 'prop-types';
import {withOnyx} from 'react-native-onyx';
import ONYXKEYS from '../ONYXKEYS';
import ImageWithSizeCalculation from './ImageWithSizeCalculation';
import addEncryptedAuthTokenToURL from '../libs/addEncryptedAuthTokenToURL';
import styles, {getWidthAndHeightStyle} from '../styles/styles';

const propTypes = {
    /** Source URL for the preview image */
    previewSourceURL: PropTypes.string.isRequired,

    /** Any additional styles to apply */
    // eslint-disable-next-line react/forbid-prop-types
    style: PropTypes.any,

    /** Current user session */
    session: PropTypes.shape({
        encryptedAuthToken: PropTypes.string.isRequired,
    }).isRequired,

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
        const thumbnailScreenWidth = 250;
        const scaleFactor = width / thumbnailScreenWidth;
        const imageHeight = height / scaleFactor;
        this.setState({thumbnailWidth: thumbnailScreenWidth, thumbnailHeight: imageHeight});
    }

    render() {
        const url = addEncryptedAuthTokenToURL({
            url: this.props.previewSourceURL,
            encryptedAuthToken: this.props.session.encryptedAuthToken,
            required: this.props.isAuthTokenRequired,
        });

        return (
            <View
                style={[
                    getWidthAndHeightStyle(this.state.thumbnailWidth, this.state.thumbnailHeight),
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
export default withOnyx({
    session: {
        key: ONYXKEYS.SESSION,
    },
})(ThumbnailImage);
