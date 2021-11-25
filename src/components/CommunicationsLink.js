import React from 'react';
import {View, Pressable, Linking} from 'react-native';
import PropTypes from 'prop-types';
import styles from '../styles/styles';
import compose from '../libs/compose';
import * as Expensicons from './Icon/Expensicons';
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
    type: PropTypes.oneOf([CONST.LOGIN_TYPE.PHONE, CONST.LOGIN_TYPE.EMAIL]).isRequired,

    /** Value to be copied or passed via tap. */
    value: PropTypes.string.isRequired,

    ...windowDimensionsPropTypes,
    ...withLocalizePropTypes,
};

const defaultProps = {
    containerStyles: [],
};

const CommunicationsLink = props => (
    <View style={[styles.flexRow, styles.pRelative, ...props.containerStyles]}>
        <View style={[
            styles.flexRow,
            styles.alignItemsCenter,
            styles.w100,
            styles.communicationsLinkHeight,
        ]}
        >
            <View style={styles.flexShrink1}>
                {props.isSmallScreenWidth
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
                    ) : props.children}
            </View>
            <ContextMenuItem
                icon={Expensicons.Clipboard}
                text={props.translate('reportActionContextMenu.copyToClipboard')}
                successIcon={Expensicons.Checkmark}
                successText={props.translate('reportActionContextMenu.copied')}
                isMini
                autoReset
                onPress={() => Clipboard.setString(props.value)}
            />
        </View>
    </View>
);

CommunicationsLink.propTypes = propTypes;
CommunicationsLink.defaultProps = defaultProps;
CommunicationsLink.displayName = 'CommunicationsLink';

export default compose(
    withWindowDimensions,
    withLocalize,
)(CommunicationsLink);
