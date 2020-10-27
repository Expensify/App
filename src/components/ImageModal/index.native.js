import React from 'react';
import PropTypes from 'prop-types';
import { View, Image, Modal, TouchableOpacity, Text, Dimensions, StatusBar } from 'react-native';
import {SafeAreaInsetsContext, SafeAreaProvider} from 'react-native-safe-area-context';
import styles, {getSafeAreaPadding} from '../../styles/StyleSheet';
import ImageZoom from 'react-native-image-pan-zoom';
import _ from 'underscore';
import Pdf from 'react-native-pdf';
import Str from '../../libs/Str';

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
            width: 200,
            height: 200,
        }
    }

    setModalVisiblity(visibility) {
        this.setState({ visible: visibility });
    }

    componentDidMount() {
        Image.getSize(this.props.srcURL, (width, height) => {
            const screenWidth = Dimensions.get('window').width;
            const scaleFactor = width / screenWidth;
            const imageHeight = height / scaleFactor;
            this.setState({imgWidth: screenWidth, imgHeight: imageHeight})
        });
    }

    render() {
        let imageView;

        if (Str.isPDF(this.props.srcURL)) {
            imageView = <Pdf source={{ uri: this.props.srcURL }} style={styles.imageModalPDF} />;
        } else {
            imageView = <ImageZoom cropWidth={Dimensions.get('window').width}
                            cropHeight={Dimensions.get('window').height}
                            imageWidth={this.state.imgWidth}
                            imageHeight={this.state.imageHeight}>
                            <Image 
                                style={{width: this.state.imgWidth, height: this.state.imageHeight}} 
                                source={{ uri:this.props.srcURL }} 
                            />
                        </ImageZoom>;
        }

        return (
            <>
                    <TouchableOpacity onPress={() => this.setModalVisiblity(true)} >
                        <Image source={{ uri: this.props.previewSrcURL }} style={[this.props.style, {width: 200, height: 175}]} />
                    </TouchableOpacity>

                <SafeAreaProvider>
                    <SafeAreaInsetsContext.Consumer style={[styles.flex1, styles.h100p]}>
                    { insets => (
                        <View style={[getSafeAreaPadding(insets)]}>
                            <Modal
                                animationType={"slide"}
                                onRequestClose={() => this.setModalVisiblity(false)}
                                visible={this.state.visible}
                            >

                                <View style={styles.appContentHeader}>
                                    <Text numberOfLines={1} style={[styles.navText]}>Attachment</Text>
                                    <Text onPress={() => this.setModalVisiblity(false)} style={{color: 'white'}}>X</Text>
                                </View>
                                {imageView}
                                
                            </Modal>
                        </View>
                    )}
                    </SafeAreaInsetsContext.Consumer>
                </SafeAreaProvider>
            </>
        );
    }
}

ImageModal.propTypes = propTypes;
ImageModal.defaultProps = defaultProps;
ImageModal.displayName = 'ImageModal';

export default ImageModal;
