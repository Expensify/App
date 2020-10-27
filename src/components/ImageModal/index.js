import React from 'react';
import PropTypes from 'prop-types';
import { View, Image, Modal, TouchableOpacity, Text } from 'react-native';
import styles from '../../styles/StyleSheet';
import _ from 'underscore';

/**
 * Text based component that is passed a URL to open onPress
 */

const propTypes = {
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

    componentWillMount() {
        Image.getSize(this.props.srcURL, (width, height) => {

        })
    }

    setModalVisiblity(visibility) {
        this.setState({ visible: visibility });
    }

    render() {

        // Hack for achieving height: auto


        return (
            <>
                <TouchableOpacity onPress={() => this.setModalVisiblity(true)} >
                    <Image source={{ uri: this.props.previewSrcURL }} style={[this.props.style, {width: 200, height: 150}]} />
                </TouchableOpacity>

                <Modal
                    animationType={"slide"}
                    onRequestClose={() => this.setModalVisiblity(false)}
                    visible={this.state.visible}
                    transparent={true}
                >
                    <View style={{ flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                        <View>
                            <Text onPress={() => this.setModalVisiblity(false)}>X</Text>
                        </View>

                        <View>
                            <Image source={{ uri: this.props.srcURL }} style={styles.imageModalImage} />
                        </View>
                    </View>
      
                </Modal>

            </>
        );
    }

}

ImageModal.propTypes = propTypes;
ImageModal.defaultProps = defaultProps;
ImageModal.displayName = 'ImageModal';

export default ImageModal;
