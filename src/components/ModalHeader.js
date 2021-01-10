import React from 'react';
import PropTypes from 'prop-types';
import {
    View, TouchableOpacity, Text,
} from 'react-native';
import styles from '../styles/styles';
import Icon from './Icon';
import {Close} from './Icon/Expensicons';

const propTypes = {
    // Title of the modal
    title: PropTypes.string,

    // Method to trigger when pressing close button of the modal
    onCloseButtonPress: PropTypes.func,
};

const defaultProps = {
    title: '',
    onCloseButtonPress: () => {},
};

const ModalHeader = props => (
    <View style={styles.modalHeaderBar}>
        <View style={[
            styles.dFlex,
            styles.flexRow,
            styles.alignItemsCenter,
            styles.flexGrow1,
            styles.justifyContentBetween,
            styles.overflowHidden,
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
                    style={[styles.touchableButtonImage]}
                >
                    <Icon icon={Close} />
                </TouchableOpacity>
            </View>
        </View>
    </View>
);

ModalHeader.propTypes = propTypes;
ModalHeader.defaultProps = defaultProps;
ModalHeader.displayName = 'ModalHeader';

export default ModalHeader;
