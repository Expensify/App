import React from 'react';
import {View, Pressable, Linking} from 'react-native';
import PropTypes from 'prop-types';
import styles from '../styles/styles';
import compose from '../libs/compose';
import {Checkmark, Clipboard as ClipboardIcon} from './Icon/Expensicons';
import Clipboard from '../libs/Clipboard';
import ContextMenuItem from './ContextMenuItem';
import withLocalize, {withLocalizePropTypes} from './withLocalize';
import withWindowDimensions, {windowDimensionsPropTypes} from './withWindowDimensions';
import CONST from '../CONST';

const propTypes = {
    /** Children to wrap in CommunicationsLink. */
    children: PropTypes.node.isRequired,

    /** Styles to be assigned to Container */
    containerStyles: PropTypes.arrayOf(PropTypes.object),

    /** Decides Tap behaviour. */
    type: PropTypes.oneOf([CONST.LOGIN_TYPE.PHONE, CONST.LOGIN_TYPE.EMAIL]),

    /** Value to be copied or passed via tap. */
    value: PropTypes.string.isRequired,

    ...windowDimensionsPropTypes,
    ...withLocalizePropTypes,
};

const defaultProps = {
    containerStyles: [],
    type: undefined,
};

const CommunicationsLink = props => (
    <View style={[styles.flexRow, styles.pRelative, ...props.containerStyles]}>
        {props.type && props.isSmallScreenWidth
            ? (
                <Pressable
                    onPress={() => Linking.openURL(
                        props.type === CONST.LOGIN_TYPE.PHONE
                            ? `tel:${props.value}`
                            : `mailto:${props.value}`,
                    )}
                >
                    {props.children}
                </Pressable>
            )
            : props.children}
        {props.type && !props.isSmallScreenWidth
            && (
                <View style={[
                    styles.pAbsolute,
                    styles.alignItemsCenter,
                    styles.justifyContentCenter,
                    styles.communicationsLinkIcon]}
                >
                    <ContextMenuItem
                        icon={ClipboardIcon}
                        text={props.translate('contextMenuItem.copyToClipboard')}
                        successIcon={Checkmark}
                        successText={props.translate('contextMenuItem.copied')}
                        isMini
                        autoReset
                        onPress={() => Clipboard.setString(props.value)}
                    />
                </View>
            )}
    </View>
);

CommunicationsLink.propTypes = propTypes;
CommunicationsLink.defaultProps = defaultProps;
CommunicationsLink.displayName = 'CommunicationsLink';

export default compose(
    withWindowDimensions,
    withLocalize,
)(CommunicationsLink);
