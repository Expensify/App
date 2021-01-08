import React from 'react';
import PropTypes from 'prop-types';
import {
    View, Image, TouchableOpacity, Text
} from 'react-native';
import styles from '../styles/styles';
import exitIcon from '../../assets/images/icon-x--20x20.png';
import downloadIcon from '../../assets/images/icon-download.png';

const propTypes = {
    // Title of the modal
    title: PropTypes.string,

    // Method to trigger when pressing close button of the modal
    onCloseButtonPress: PropTypes.func,

    // Method to trigger when pressing download button of the modal
    onDownloadButtonPress: PropTypes.func,
};

const defaultProps = {
    title: '',
    onCloseButtonPress: () => {},
    onDownloadButtonPress: () => {},
};

const ModalHeader = props => (
    <View style={styles.modalHeaderBar}>
        <View style={[
            styles.dFlex,
            styles.flexRow,
            styles.alignItemsCenter,
            styles.flexGrow1,
            styles.justifyContentBetween,
            styles.overflowHidden
        ]}
        >
            <View style={[styles.flex1]}>
                <Text numberOfLines={1} style={[styles.navText]}>
                    {props.title}
                </Text>
            </View>
            <View style={[styles.reportOptions, styles.flexRow]}>
                <TouchableOpacity
                    onPress={props.onDownloadButtonPress}
                    style={[styles.touchableButtonImage]}
                >
                    <Image
                        resizeMode="contain"
                        style={[styles.attachmentDownloadIcon]}
                        source={downloadIcon}
                    />
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={props.onCloseButtonPress}
                    style={[styles.touchableButtonImage]}
                >
                    <Image
                        resizeMode="contain"
                        style={[styles.attachmentCloseIcon]}
                        source={exitIcon}
                    />
                </TouchableOpacity>
            </View>
        </View>
    </View>
);

ModalHeader.propTypes = propTypes;
ModalHeader.defaultProps = defaultProps;
ModalHeader.displayName = 'ModalHeader';

export default ModalHeader;
