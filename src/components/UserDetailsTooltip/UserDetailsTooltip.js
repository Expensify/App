import React, { useCallback } from 'react';
import { View, Text } from 'react-native';
import { withOnyx } from 'react-native-onyx';
import lodashGet from 'lodash/get';
import Avatar from '../Avatar';
import Tooltip from '../Tooltip';
import { propTypes, defaultProps } from './userDetailsTooltipPropTypes';
import styles from '../../styles/styles';
import ONYXKEYS from '../../ONYXKEYS';

function UserDetailsTooltip(props){

    const userDetails = lodashGet(props.personalDetailsList, props.accountID, props.fallbackUserDetails);
    const renderTooltipContent = useCallback(() => 
         (
            <View style={[styles.alignItemsCenter, styles.ph2]}>
                <View style={styles.emptyAvatar}>
                    <Avatar
                        containerStyles={[styles.actionAvatar]}
                        source={userDetails.avatar}
                    />
                </View>

                {String(userDetails.displayName).trim() ? <Text style={[styles.mt1, styles.textMicroBold, styles.textReactionSenders, styles.textAlignCenter]}>{userDetails.displayName}</Text> : ''}

                {String(userDetails.login).trim() ? <Text style={[styles.textMicro, styles.fontColorReactionLabel]}>{userDetails.login}</Text> : ''}

        </View>
        )
      , [userDetails.avatar, userDetails.displayName, userDetails.login]);

    return (
        <Tooltip renderTooltipContent={userDetails.avatar ? renderTooltipContent : undefined}>
            {props.children}
        </Tooltip>
    )
}

UserDetailsTooltip.propTypes = propTypes
UserDetailsTooltip.defaultProps = defaultProps
UserDetailsTooltip.displayName = 'UserDetailsTooltip'

export default withOnyx({
    personalDetailsList: {
        key: ONYXKEYS.PERSONAL_DETAILS_LIST,
    },
})(UserDetailsTooltip);
