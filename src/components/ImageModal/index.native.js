import React from 'react';
import PropTypes from 'prop-types';
import { View, Image, Modal, TouchableOpacity, Text, Dimensions } from 'react-native';
import styles from '../../style/StyleSheet';
import ImageViewer from 'react-native-image-zoom-viewer';
import _ from 'underscore';
import Pdf from 'react-native-pdf';
import Str from '../../lib/Str';

/**
 * Text based component that is passed a URL to open onPress
 */

const propTypes = {
    // Object array of images
    images: PropTypes.array,

    // URL to image preview
    previewSrcURL: PropTypes.string,

    // URL to full-sized image
    srcURL: PropTypes.string,

    // Any additional styles to apply
    // eslint-disable-next-line react/forbid-prop-types
    style: PropTypes.any,
};

const defaultProps = {
    previewSrcURL: '',
    srcURL: '',
    style: {},
};

class ImageModal extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            visible: false,
        }
    }

    setModalVisiblity(visibility) {
        this.setState({ visible: visibility });
    }

    render() {
        let imageView;

        if (Str.isPDF(this.props.srcURL)) {
            imageView = <Pdf source={{ uri: this.props.srcURL }} style={styles.imageModalPDF} />;
        } else {
            imageView= <ImageViewer imageUrls={[{ url: this.props.srcURL, cache: true }]} enableSwipeDown={true} onSwipeDown={() => this.setModalVisiblity(false)} />;
        }

        return (
            <>
                <TouchableOpacity onPress={() => this.setModalVisiblity(true)} >
                    <Image source={{ uri: this.props.previewSrcURL }} style={[this.props.style, {width: 200, height: 175}]} />
                </TouchableOpacity>

                <Modal
                    animationType={"slide"}
                    onRequestClose={() => this.setModalVisiblity(false)}
                    visible={this.state.visible}
                >

                    <View style={styles.imageModalHeader}>
                        <Text onPress={() => this.setModalVisiblity(false)} style={{color: 'white'}}>X</Text>
                    </View>
                    {imageView}
                    
                </Modal>
            </>
        );
    }

}

ImageModal.propTypes = propTypes;
ImageModal.defaultProps = defaultProps;
ImageModal.displayName = 'ImageModal';

export default ImageModal;
