import React from 'react';
import PropTypes from 'prop-types';
import {
    View, Image, TouchableOpacity, Text
} from 'react-native';
import styles from '../styles/styles';
import exitIcon from '../../assets/images/icon-x--20x20.png';

const propTypes = {
    // Title of the header
    title: PropTypes.string,

    // Method to trigger when pressing close button of the header
    onCloseButtonPress: PropTypes.func,
};

const defaultProps = {
    title: '',
    onCloseButtonPress: () => {},
};

const HeaderWithCloseButton = props => (
    <View style={styles.headerBar}>
        <View style={[
            styles.dFlex,
            styles.flexRow,
            styles.alignItemsCenter,
            styles.flexGrow1,
            styles.flexJustifySpaceBetween,
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
                    onPress={props.onCloseButtonPress}
                    style={[styles.touchableButtonImage, styles.mr0]}
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

HeaderWithCloseButton.propTypes = propTypes;
HeaderWithCloseButton.defaultProps = defaultProps;
HeaderWithCloseButton.displayName = 'HeaderWithCloseButton';

export default HeaderWithCloseButton;
