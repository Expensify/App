import React, { useCallback } from 'react';
import { View, Text } from 'react-native';
import Avatar from '../Avatar';
import Tooltip from '../Tooltip';
import { propTypes, defaultProps } from './userDetailsTooltipPropTypes';
import styles from '../../styles/styles';

function UserDetailsTooltip(props){

    const renderTooltipContent = useCallback(() => {
        return (
            <View style={[styles.alignItemsCenter, styles.ph2]}>
                <View style={styles.flexRow}>
                    <Avatar
                        containerStyles={[styles.actionAvatar]}
                        source={props.avatarSource}
                    />
                </View>

                {Boolean(props.name.trim()) ? <Text style={[styles.mt1, styles.textMicroBold, styles.textReactionSenders, styles.textAlignCenter]}>{props.name}</Text> : ''}

                {Boolean(props.login.trim()) ? <Text style={[styles.textMicro, styles.fontColorReactionLabel]}>{props.login}</Text> : ''}

        </View>
        );
      }, [props.avatarSource, props.name, props.login]);

    return (
        <Tooltip renderTooltipContent={renderTooltipContent}>
            {props.children}
        </Tooltip>
    )
}

UserDetailsTooltip.propTypes = propTypes
UserDetailsTooltip.defaultProps = defaultProps
UserDetailsTooltip.displayName = 'UserDetailsTooltip'

export default UserDetailsTooltip;
