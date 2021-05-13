import React from 'react';
import PropTypes from 'prop-types';
import {
    View, TouchableOpacity,
} from 'react-native';
import styles from '../styles/styles';
import Header from './Header';
import Icon from './Icon';
import {Close, Download, BackArrow} from './Icon/Expensicons';
import withLocalize, {withLocalizePropTypes} from './withLocalize';

const propTypes = {
    /** Title of the Header */
    title: PropTypes.string,

    /** Method to trigger when pressing download button of the header */
    onDownloadButtonPress: PropTypes.func,

    /** Method to trigger when pressing close button of the header */
    onCloseButtonPress: PropTypes.func,

    /** Method to trigger when pressing back button of the header */
    onBackButtonPress: PropTypes.func,

    /** Whether we should show a back icon */
    shouldShowBackButton: PropTypes.bool,

    /** Fontsize for the text in the Header */
    textSize: PropTypes.oneOf(['default', 'large']),

    /** Whether we should show a border on the bottom of the Header */
    shouldShowBorderBottom: PropTypes.bool,

    ...withLocalizePropTypes,
};

const defaultProps = {
    title: '',
    onDownloadButtonPress: () => {},
    onCloseButtonPress: () => {},
    onBackButtonPress: () => {},
    shouldShowBackButton: false,
    textSize: 'large',
    shouldShowBorderBottom: false,
};

const HeaderWithCloseButton = props => (
    <View style={[styles.headerBar, props.shouldShowBorderBottom && styles.borderBottom]}>
        <View style={[
            styles.dFlex,
            styles.flexRow,
            styles.alignItemsCenter,
            styles.flexGrow1,
            styles.justifyContentBetween,
            styles.overflowHidden,
        ]}
        >
            {props.shouldShowBackButton && (
            <TouchableOpacity
                onPress={props.onBackButtonPress}
                style={[styles.touchableButtonImage]}
            >
                <Icon src={BackArrow} />
            </TouchableOpacity>
            )}
            <Header title={props.title} textSize={props.textSize} />
            <View style={[styles.reportOptions, styles.flexRow]}>
                {
                    props.title === props.translate('common.attachment') && (
                        <TouchableOpacity
                            onPress={props.onDownloadButtonPress}
                            style={[styles.touchableButtonImage]}
                        >
                            <Icon src={Download} />
                        </TouchableOpacity>
                    )
                }

                <TouchableOpacity
                    onPress={props.onCloseButtonPress}
                    style={[styles.touchableButtonImage]}
                >
                    <Icon src={Close} />
                </TouchableOpacity>
            </View>
        </View>
    </View>
);

HeaderWithCloseButton.propTypes = propTypes;
HeaderWithCloseButton.defaultProps = defaultProps;
HeaderWithCloseButton.displayName = 'HeaderWithCloseButton';

export default withLocalize(HeaderWithCloseButton);
