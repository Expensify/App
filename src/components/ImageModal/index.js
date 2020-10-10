import React from 'react';
import PropTypes from 'prop-types';
import { View, Image, Modal, TouchableOpacity, Text } from 'react-native';
import styles from '../../style/StyleSheet';
import ImageView from "react-native-image-viewing";

/**
 * Text based component that is passed a URL to open onPress
 */

const propTypes = {
    // The preview of the image
    previewSrc: PropTypes.string,

    // The full sized image
    src: PropTypes.string,

    // Any additional styles to apply
    // eslint-disable-next-line react/forbid-prop-types
    style: PropTypes.any,
};

const defaultProps = {
    previewSrc: '',
    src: '',
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
        return (
            <View>
                <TouchableOpacity onPress={() => this.setModalVisiblity(true)}>
                    <Image source={{ uri: this.props.previewSrc }} style={{width: 100, height: 100}} />
                </TouchableOpacity>

                <Modal
                    animationType={"slide"}
                    onRequestClose={() => this.setModalVisiblity(false)}
                    visible={this.state.visible}
                >
                    <View style={styles.imageModalHeader}>
                        <Text onPress={() => this.setModalVisiblity(false)}>X</Text>
                    </View>
                    <View style={styles.imageModal}>
                        <View style={styles.imageModalPlaceholder}>
                            <Image style={styles.imageModalImage}  source={{ uri: this.props.previewSrc }} />
                        </View>
                    </View>
                </Modal>
            </View>
        );
    }

}

ImageModal.propTypes = propTypes;
ImageModal.defaultProps = defaultProps;
ImageModal.displayName = 'ImageModal';

export default ImageModal;
