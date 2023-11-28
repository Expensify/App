import PropTypes from 'prop-types';
import React from 'react';
import {View} from 'react-native';
import Clipboard from '@libs/Clipboard';
import useThemeStyles from '@styles/useThemeStyles';
import ContextMenuItem from './ContextMenuItem';
import * as Expensicons from './Icon/Expensicons';
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

function CommunicationsLink(props) {
    const styles = useThemeStyles();
    return (
        <View style={[styles.flexRow, styles.pRelative, ...props.containerStyles]}>
            <View style={[styles.flexRow, styles.alignItemsCenter, styles.w100, styles.communicationsLinkHeight]}>
                <View style={styles.flexShrink1}>{props.children}</View>
                <ContextMenuItem
                    icon={Expensicons.Copy}
                    text={props.translate('reportActionContextMenu.copyToClipboard')}
                    successIcon={Expensicons.Checkmark}
                    successText={props.translate('reportActionContextMenu.copied')}
                    isMini
                    onPress={() => Clipboard.setString(props.value)}
                />
            </View>
        </View>
    );
}

CommunicationsLink.propTypes = propTypes;
CommunicationsLink.defaultProps = defaultProps;
CommunicationsLink.displayName = 'CommunicationsLink';

export default withLocalize(CommunicationsLink);
