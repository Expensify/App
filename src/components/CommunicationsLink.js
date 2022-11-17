import React from 'react';
import {View} from 'react-native';
import PropTypes from 'prop-types';
import styles from '../styles/styles';
import * as Expensicons from './Icon/Expensicons';
import Clipboard from '../libs/Clipboard';
import ContextMenuItem from './ContextMenuItem';
import withLocalize, {withLocalizePropTypes} from './withLocalize';

const propTypes = {
    /** Children to wrap in CommunicationsLink. */
    children: PropTypes.node.isRequired,

    /** Styles to be assigned to Container */
    // eslint-disable-next-line react/forbid-prop-types
    containerStyles: PropTypes.arrayOf(PropTypes.object),

    /** Value to be copied or passed via tap. */
    value: PropTypes.string.isRequired,

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
                {props.children}
            </View>
            <ContextMenuItem
                icon={Expensicons.Clipboard}
                text={props.translate('reportActionContextMenu.copyToClipboard')}
                successIcon={Expensicons.Checkmark}
                successText={props.translate('reportActionContextMenu.copied')}
                isMini
                onPress={() => Clipboard.setString(props.value)}
            />
        </View>
    </View>
);

CommunicationsLink.propTypes = propTypes;
CommunicationsLink.defaultProps = defaultProps;
CommunicationsLink.displayName = 'CommunicationsLink';

export default withLocalize(CommunicationsLink);
