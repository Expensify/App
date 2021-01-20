import React from 'react';
import PropTypes from 'prop-types';
import {
    View, Image, TouchableOpacity,
} from 'react-native';
import styles from '../styles/styles';
import exitIcon from '../../assets/images/icon-x--20x20.png';
import Header from './Header';
import Icon from './Icon';
import {Close} from './Icon/Expensicons';

const propTypes = {
    /** Title of the Header */
    title: PropTypes.string,

    /** Method to trigger when pressing close button of the header */
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
            styles.justifyContentBetween,
            styles.overflowHidden,
        ]}
        >
            <Header title={props.title} />
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

HeaderWithCloseButton.propTypes = propTypes;
HeaderWithCloseButton.defaultProps = defaultProps;
HeaderWithCloseButton.displayName = 'HeaderWithCloseButton';

export default HeaderWithCloseButton;
