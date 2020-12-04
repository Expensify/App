import React, {Component} from 'react';
import {Image} from 'react-native';
import PropTypes from 'prop-types';
import {withOnyx} from 'react-native-onyx';
import ONYXKEYS from '../ONYXKEYS';

const propTypes = {
    // Source URL for the preview image
    previewSourceURL: PropTypes.string.isRequired,

    // Any additional styles to apply
    // eslint-disable-next-line react/forbid-prop-types
    style: PropTypes.any,

    // Current user session
    session: PropTypes.shape({
        authToken: PropTypes.string.isRequired,
    }).isRequired,

    // Do the urls require an authToken?
    isAuthTokenRequired: PropTypes.bool.isRequired,
};

const defaultProps = {
    style: {},
};

class ThumbnailImage extends Component {
    constructor(props) {
        super(props);

        this.state = {
            thumbnailWidth: 200,
            thumbnailHeight: 200,
        };

        this.isComponentMounted = false;
    }

    componentDidMount() {
        // If the component unmounts by the time getSize() is finished, it will throw a warning
        // So this is to prevent setting state if the component isn't mounted
        this.isComponentMounted = true;

        // Scale image for thumbnail preview
        Image.getSize(this.props.previewSourceURL, (width, height) => {
            // Width of the thumbnail works better as a constant than it does
            // a percentage of the screen width since it is relative to each screen
            const thumbnailScreenWidth = 250;
            const scaleFactor = width / thumbnailScreenWidth;
            const imageHeight = height / scaleFactor;

            if (this.isComponentMounted) {
                this.setState({thumbnailWidth: thumbnailScreenWidth, thumbnailHeight: imageHeight});
            }
        });
    }

    componentWillUnmount() {
        this.isComponentMounted = false;
    }

    /**
     * Add authToken to this attachment URL if necessary
     *
     * @param {String} url
     * @returns {String}
     */
    addAuthTokenToURL(url) {
        return this.props.isAuthTokenRequired
            ? `${url}?authToken=${this.props.session.authToken}`
            : url;
    }

    render() {
        return (
            <Image
                style={{
                    ...this.props.style,
                    width: this.state.thumbnailWidth,
                    height: this.state.thumbnailHeight,
                }}
                source={{uri: this.addAuthTokenToURL(this.props.previewSourceURL)}}
            />
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
