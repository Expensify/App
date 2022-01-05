import React from 'react';
import {View, TouchableOpacity} from 'react-native';
import PropTypes from 'prop-types';
import styles from '../styles/styles';
import Popover from './Popover';
import withWindowDimensions, {windowDimensionsPropTypes} from './withWindowDimensions';
import withLocalize, {withLocalizePropTypes} from './withLocalize';
import compose from '../libs/compose';
import Text from './Text';

const propTypes = {

    /** A callback to call when the form has been submitted */
    onConfirm: PropTypes.func.isRequired,

    /** Modal visibility */
    isVisible: PropTypes.bool.isRequired,

    /** Where the popover should be positioned */
    anchorPosition: PropTypes.shape({
        top: PropTypes.number,
        left: PropTypes.number,
    }).isRequired,

    ...withLocalizePropTypes,
    ...windowDimensionsPropTypes,
};

const CloseAccountPopover = props => (
    <Popover
        onSubmit={props.onConfirm}
        isVisible={props.isVisible}
        anchorPosition={props.anchorPosition}
    >
        <View
            style={[
                styles.m5,
                styles.alignItemsCenter,
                !props.isSmallScreenWidth ? styles.defaultCloseAccountPopover : '',
            ]}
        >
            <Text
                style={[
                    styles.alignSelfCenter,
                ]}
            >
                {props.translate('closeAccountPage.closeAccountActionRequired')}
            </Text>
            <TouchableOpacity
                style={[
                    styles.button,
                    styles.mt4,
                    styles.w100,
                    styles.buttonSuccess,
                    styles.alignSelfCenter,
                ]}
            >
                <Text
                    style={[
                        styles.buttonText,
                        styles.textWhite,
                    ]}
                >
                    {props.translate('closeAccountPage.okayGotIt')}
                </Text>
            </TouchableOpacity>
        </View>
    </Popover>
);

CloseAccountPopover.propTypes = propTypes;
CloseAccountPopover.displayName = 'CloseAccountPopover';
export default compose(
    withWindowDimensions,
    withLocalize,
)(CloseAccountPopover);
