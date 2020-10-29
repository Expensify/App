import React from 'react';
import PropTypes from 'prop-types';
import { View, Image, Modal, TouchableOpacity, Text, Dimensions, ImageBackground } from 'react-native';
import exitIcon from '../../../assets/images/icon-x.png';
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
            imgWidth: 200,
            imgHeight: 200,
        }
    }

    componentWillMount() {
        Image.getSize(this.props.srcURL, (width, height) => {this.setState({imgWidth: width, imgHeight: height})});
    }

    setModalVisiblity(visibility) {
        this.setState({ visible: visibility });
    }

    render() {

        return (
            <>
                <TouchableOpacity onPress={() => this.setModalVisiblity(true)} >
                    <Image source={{ uri: this.props.previewSrcURL }} style={[this.props.style, {width: 200, height: 150}]} />
                </TouchableOpacity>

                <Modal
                    onRequestClose={() => this.setModalVisiblity(false)}
                    visible={this.state.visible}
                    transparent={true}
                >
                    <View style={{
                        flex: 1,
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center',
                        backgroundColor: '#00000080',
                    }}>
                        <View style={{width: Dimensions.get('window').width * 0.8, height: Dimensions.get('window').height * 0.8}}>
                            <View style={styles.imageModalContentHeader}>
                                <View style={[
                                    styles.dFlex,
                                    styles.flexRow,
                                    styles.alignItemsCenter,
                                    styles.flexGrow1,
                                    styles.flexJustifySpaceBetween,
                                    styles.overflowHidden
                                ]}>
                                    <View>
                                        <Text numberOfLines={1} style={[styles.navText]}>Attachment</Text>
                                    </View>
                                    <View style={[styles.reportOptions, styles.flexRow]} >
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
                            <View style={{
                                flex: 1,
                                flexDirection: 'column',
                                justifyContent: 'center',
                                alignItems: 'center',
                                backgroundColor: '#FFFFFF',
                                borderWidth: 1,
                                borderBottomLeftRadius: 20,
                                borderBottomRightRadius: 20,
                                overflow: 'hidden',
                                borderColor: '#ECECEC',
                            }}>
                                <View>
                                    <Image
                                        source={{ uri: this.props.srcURL }} 
                                        style={{width: 200, height: 200}} 
                                    />
                                </View>
                            </View>
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
