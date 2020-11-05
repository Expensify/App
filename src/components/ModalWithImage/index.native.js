import React from 'react';
import PropTypes from 'prop-types';
import {
    View, Image, Modal, TouchableOpacity, Text, Dimensions
} from 'react-native';
import styles from '../../styles/StyleSheet';
import Str from '../../libs/Str';
import PDFView from '../PDFView';
import ImageView from '../ImageView';
import BaseModal from '../BaseModal';

/**
 * Image modal component that is triggered when pressing on an image
 */

const propTypes = {
    // URL to image preview
    previewSourceURL: PropTypes.string,

    // URL to full-sized image
    sourceURL: PropTypes.string,

    // Any additional styles to apply
    // eslint-disable-next-line react/forbid-prop-types
    style: PropTypes.any,
};

const defaultProps = {
    previewSourceURL: '',
    sourceURL: '',
    style: {},
};

class ModalWithImage extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            imgWidth: 200,
            imgHeight: 200,
        };
    }

    componentDidMount() {
        // Scale image for modal view
        Image.getSize(this.props.sourceURL, (width, height) => {
            const screenWidth = Dimensions.get('window').width;
            const scaleFactor = width / screenWidth;
            const imageHeight = height / scaleFactor;
            this.setState({imgWidth: screenWidth, imgHeight: imageHeight});
        });
    }

    render() {
        return (
            <>
                <TouchableOpacity onPress={() => this.setModalVisiblity(true)}>
                    <Image
                        source={{uri: this.props.previewSourceURL}}
                        style={[
                            this.props.style,
                            {width: this.state.thumbnailWidth, height: this.state.thumbnailHeight}
                        ]}
                    />
                </TouchableOpacity>

                <BaseModal pinToEdges={false} title="Attachment" visible={this.state.visible} setModalVisiblity={this.setModalVisiblity}>
                    {(Str.isPDF(this.props.sourceURL)) ? (
                        <PDFView
                            sourceURL={this.props.sourceURL}
                            style={styles.imageModalPDF}
                        />
                    ) : (
                        <ImageView
                            imageWidth={this.state.imgWidth}
                            imageHeight={this.state.imgHeight + 87}
                            sourceURL={this.props.sourceURL}
                        />
                    )}
                </BaseModal>
            </>
        );
    }
}

ModalWithImage.propTypes = propTypes;
ModalWithImage.defaultProps = defaultProps;

export default ModalWithImage;
