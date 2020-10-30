import React from 'react';
import PropTypes from 'prop-types';
import {
    View, Image, Modal, TouchableOpacity, Text, Dimensions, TouchableWithoutFeedback
} from 'react-native';
import _ from 'underscore';
import {WebView} from 'react-native-webview';
import exitIcon from '../../../assets/images/icon-x.png';
import styles from '../../styles/StyleSheet';
import Str from '../../libs/Str';

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
            imgWidth: 200,
            imgHeight: 200,
        };
    }

    componentDidMount() {
        Image.getSize(this.props.srcURL, (width, height) => {
            const screenWidth = Dimensions.get('window').width * 0.6;
            const scaleFactor = width / screenWidth;
            const imageHeight = height / scaleFactor;
            this.setState({imgWidth: screenWidth, imgHeight: imageHeight});
        });

        Image.getSize(this.props.previewSrcURL, (width, height) => {
            const screenWidth = 300;
            const scaleFactor = width / screenWidth;
            const imageHeight = height / scaleFactor;
            this.setState({thumbnailWidth: screenWidth, thumbnailHeight: imageHeight});
        });
    }

    setModalVisiblity(visibility) {
        this.setState({visible: visibility});
    }

    render() {
        let imageView;

        if (Str.isPDF(this.props.srcURL)) {
            const pdfViewUrl = `http://mozilla.github.com/pdf.js/web/viewer.html?file=${encodeURIComponent(this.props.srcURL)}`;
            imageView = <WebView source={{uri: pdfViewUrl}} />;
        } else {
            imageView = (
                <View style={styles.imageModalImageContainer}>
                    <Image
                        source={{uri: this.props.srcURL}}
                        style={{width: this.state.imgWidth, height: this.state.imgHeight}}
                    />
                </View>
            );
        }

        return (
            <>
                <TouchableOpacity onPress={() => this.setModalVisiblity(true)}>
                    <Image
                        source={{uri: this.props.previewSrcURL}}
                        style={[this.props.style, {width: this.state.thumbnailWidth, height: this.state.thumbnailHeight}]}
                    />
                </TouchableOpacity>


                <Modal
                    onRequestClose={() => this.setModalVisiblity(false)}
                    visible={this.state.visible}
                    transparent
                >

                    <TouchableOpacity
                        style={styles.imageModalCenterContainer}
                        activeOpacity={1}
                        onPress={() => this.setModalVisiblity(false)}
                    >
                        <TouchableWithoutFeedback style={{cursor: 'none'}}>
                            <View style={{...styles.imageModalContainer, width: Dimensions.get('window').width * 0.8, height: Dimensions.get('window').height * 0.8}}>
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
                                <View style={styles.imageModalImageCenterContainer}>
                                    {imageView}
                                </View>
                            </View>
                        </TouchableWithoutFeedback>
                    </TouchableOpacity>
                </Modal>


            </>
        );
    }
}

ImageModal.propTypes = propTypes;
ImageModal.defaultProps = defaultProps;
ImageModal.displayName = 'ImageModal';

export default ImageModal;
