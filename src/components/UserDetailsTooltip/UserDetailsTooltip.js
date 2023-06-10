import React, { useCallback } from 'react';
import { View, Text } from 'react-native';
import Avatar from '../Avatar';
import Tooltip from '../Tooltip';
import { propTypes, defaultProps } from './userDetailsTooltipPropTypes';
import styles from '../../styles/styles';
import { withOnyx } from 'react-native-onyx';
import ONYXKEYS from '../../ONYXKEYS';
import lodashGet from 'lodash/get';
function UserDetailsTooltip(props){

    const userDetails = lodashGet(props.personalDetailsList, props.accountID, props.fallbackUserDetails);
    const renderTooltipContent = useCallback(() => {
        return (
            <View style={[styles.alignItemsCenter, styles.ph2]}>
                <View style={styles.flexRow}>
                    <Avatar
                        containerStyles={[styles.actionAvatar]}
                        source={userDetails.avatar}
                    />
                </View>

                {Boolean(String(userDetails.displayName).trim()) ? <Text style={[styles.mt1, styles.textMicroBold, styles.textReactionSenders, styles.textAlignCenter]}>{userDetails.displayName}</Text> : ''}

                {Boolean(String(userDetails.login).trim()) ? <Text style={[styles.textMicro, styles.fontColorReactionLabel]}>{userDetails.login}</Text> : ''}

        </View>
        );
      }, [props.accountID]);

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
