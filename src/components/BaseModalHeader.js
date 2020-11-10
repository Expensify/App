import React from 'react';
import PropTypes from 'prop-types';
import {
    View, Image, TouchableOpacity, Text
} from 'react-native';
import styles from '../styles/StyleSheet';
import exitIcon from '../../assets/images/icon-x.png';

const propTypes = {
    // Title of the modal
    title: PropTypes.string,

    // Method passed down to update visibility of the modal
    setModalVisiblity: PropTypes.func.isRequired,
};

const defaultProps = {
    title: '',
};

const BaseModalHeader = props => (
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
                <Text numberOfLines={1} style={[styles.navText]}>{props.title}</Text>
            </View>
            <View style={[styles.reportOptions, styles.flexRow]}>
                <TouchableOpacity
                    onPress={() => props.setModalVisiblity(false)}
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
);

BaseModalHeader.propTypes = propTypes;
BaseModalHeader.defaultProps = defaultProps;
BaseModalHeader.displayName = 'BaseModalHeader';

export default BaseModalHeader;
