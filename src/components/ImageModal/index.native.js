import React from 'react';
import PropTypes from 'prop-types';
import {
    View, Image, Modal, TouchableOpacity, Text, Dimensions
} from 'react-native';
import ImageZoom from 'react-native-image-pan-zoom';
import Pdf from 'react-native-pdf';
import exitIcon from '../../../assets/images/icon-x.png';
import styles from '../../styles/StyleSheet';
import Str from '../../libs/Str';

/**
 * Image modal component that is triggered by an onpress on an image preview
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
            imgWidth: 200,
            imgHeight: 200,
            thumbnailWidth: 300,
            thumbnailHeight: 150,
        };
    }

    componentDidMount() {
        // Scale image for modal view
        Image.getSize(this.props.srcURL, (width, height) => {
            const screenWidth = Dimensions.get('window').width;
            const scaleFactor = width / screenWidth;
            const imageHeight = height / scaleFactor;
            this.setState({imgWidth: screenWidth, imgHeight: imageHeight});
        });

        // Scale image for thumbnail preview
        Image.getSize(this.props.previewSrcURL, (width, height) => {
            const screenWidth = 300;
            const scaleFactor = width / screenWidth;
            const imageHeight = height / scaleFactor;
            this.setState({thumbnailWidth: screenWidth, thumbnailHeight: imageHeight});
        });
    }

    /**
     * Updates the visibility of the modal
     *
     * @param {bool} visibility
     */
    setModalVisiblity(visibility) {
        this.setState({visible: visibility});
    }

    render() {
        return (
            <>
                <TouchableOpacity onPress={() => this.setModalVisiblity(true)}>
                    <Image
                        source={{uri: this.props.previewSrcURL}}
                        style={{
                            ...this.props.style,
                            width: this.state.thumbnailWidth,
                            height: this.state.thumbnailHeight
                        }}
                    />
                </TouchableOpacity>

                <Modal
                    animationType="slide"
                    onRequestClose={() => this.setModalVisiblity(false)}
                    visible={this.state.visible}
                    transparent
                >
                    <View style={styles.imageModalContainer}>
                        <View style={styles.imageModalHeader}>
                            <View style={[
                                styles.dFlex,
                                styles.flexRow,
                                styles.alignItemsCenter,
                                styles.flexGrow1,
                                styles.flexJustifySpaceBetween,
                                styles.overflowHidden
                            ]}
                            >
                                <View>
                                    <Text numberOfLines={1} style={[styles.navText]}>Attachment</Text>
                                </View>
                                <View style={[styles.reportOptions, styles.flexRow]}>
                                    <TouchableOpacity
                                        onPress={() => this.setModalVisiblity(false)}
                                        style={[styles.touchableButtonImage, styles.mr0]}
                                    >
                                        <Image
                                            resizeMode="contain"
                                            style={[styles.LHNToggleIcon]}
                                            source={exitIcon}
                                        />
                                    </TouchableOpacity>
                                </View>
                            </View>

                        </View>
                        {(Str.isPDF(this.props.srcURL)) ? (
                            <Pdf
                                source={{uri: this.props.srcURL}}
                                style={styles.imageModalPDF}
                            />
                        ) : (
                            <ImageZoom
                                cropWidth={Dimensions.get('window').width}
                                cropHeight={Dimensions.get('window').height - 87}
                                imageWidth={this.state.imgWidth}
                                imageHeight={this.state.imgHeight + 87}
                            >
                                <Image
                                    style={{width: this.state.imgWidth, height: this.state.imgHeight}}
                                    source={{uri: this.props.srcURL}}
                                />
                            </ImageZoom>
                        )}
                    </View>
                </Modal>
            </>
        );
    }
}

ImageModal.propTypes = propTypes;
ImageModal.defaultProps = defaultProps;

export default ImageModal;
