import React from 'react';
import {View, Pressable, Linking} from 'react-native';
import PropTypes from 'prop-types';
import styles from '../styles/styles';
import compose from '../libs/compose';
import {Checkmark, Clipboard as ClipboardIcon} from './Icon/Expensicons';
import Clipboard from '../libs/Clipboard';
import ReportActionContextMenuItem from '../pages/home/report/ReportActionContextMenuItem';
import withLocalize, {withLocalizePropTypes} from './withLocalize';
import withWindowDimensions, {windowDimensionsPropTypes} from './withWindowDimensions';

const propTypes = {
    /** Children to wrap in TappableCopy. */
    children: PropTypes.node.isRequired,

    /** Styles to be assigned to Container */
    style: PropTypes.arrayOf(PropTypes.object),

    /** Decides Tap behaviour. */
    type: PropTypes.oneOf(['phone', 'email']),

    /** Value to be copied or passed via tap. */
    value: PropTypes.string.isRequired,

    ...windowDimensionsPropTypes,
    ...withLocalizePropTypes,
};

const defaultProps = {
    style: [],
    type: undefined,
};

const TappableCopy = props => (
    <View style={[styles.flexRow, styles.pRelative, ...props.style]}>
        {props.type && props.isSmallScreenWidth
            ? (
                <Pressable
                    onPress={() => Linking.openURL(
                        props.type === 'phone'
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
                    {right: -36, top: 0, bottom: 0}]}
                >
                    <ReportActionContextMenuItem
                        icon={ClipboardIcon}
                        text={props.translate('reportActionContextMenu.copyToClipboard')}
                        successIcon={Checkmark}
                        successText={props.translate('reportActionContextMenu.copied')}
                        isMini
                        autoReset
                        onPress={() => Clipboard.setString(props.value)}
                    />
                </View>
            )}
    </View>
);


TappableCopy.propTypes = propTypes;
TappableCopy.defaultProps = defaultProps;
TappableCopy.displayName = 'TappableCopy';

export default compose(
    withWindowDimensions,
    withLocalize,
)(TappableCopy);
