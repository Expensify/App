import React, {useCallback} from 'react';
import {View, Text} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import Str from 'expensify-common/lib/str';
import lodashGet from 'lodash/get';
import _ from 'underscore';
import Avatar from '../Avatar';
import Tooltip from '../Tooltip';
import {propTypes, defaultProps} from './userDetailsTooltipPropTypes';
import styles from '../../styles/styles';
import ONYXKEYS from '../../ONYXKEYS';
import * as UserUtils from '../../libs/UserUtils';
import CONST from '../../CONST';

function UserDetailsTooltip(props) {
    const userDetails = lodashGet(props.personalDetailsList, props.accountID, props.fallbackUserDetails);
    let title = String(userDetails.displayName).trim() ? userDetails.displayName : '';
    const subtitle = String(userDetails.login || '').trim() && !_.isEqual(userDetails.login, userDetails.displayName) ? Str.removeSMSDomain(userDetails.login) : '';
    if (props.icon && props.icon.type === CONST.ICON_TYPE_WORKSPACE) {
        title = props.icon.name;
    }
    const renderTooltipContent = useCallback(
        () => (
            <View style={[styles.alignItemsCenter, styles.ph2, styles.pv2]}>
                <View style={styles.emptyAvatar}>
                    <Avatar
                        containerStyles={[styles.actionAvatar]}
                        source={props.icon ? props.icon.source : UserUtils.getAvatar(userDetails.avatar, userDetails.accountID)}
                        type={props.icon ? props.icon.type : CONST.ICON_TYPE_AVATAR}
                        name={props.icon ? props.icon.name : userDetails.login}
                    />
                </View>

                <Text style={[styles.mt2, styles.textMicroBold, styles.textReactionSenders, styles.textAlignCenter]}>{title}</Text>

                <Text style={[styles.textMicro, styles.fontColorReactionLabel]}>{subtitle}</Text>
            </View>
        ),
        [props.icon, userDetails.avatar, userDetails.accountID, userDetails.login, title, subtitle],
    );

    if (!props.icon && !userDetails.displayName && !userDetails.login) {
        return props.children;
    }

    return <Tooltip renderTooltipContent={renderTooltipContent}>{props.children}</Tooltip>;
}

UserDetailsTooltip.propTypes = propTypes;
UserDetailsTooltip.defaultProps = defaultProps;
UserDetailsTooltip.displayName = 'UserDetailsTooltip';

export default withOnyx({
    personalDetailsList: {
        key: ONYXKEYS.PERSONAL_DETAILS_LIST,
    },
})(UserDetailsTooltip);
