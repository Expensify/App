import React from 'react';
import { View, Text } from 'react-native';
import Avatar from '../Avatar';
import Tooltip from '../Tooltip';
import { propTypes, defaultProps } from './userDetailsTooltipPropTypes';
import styles from '../../styles/styles';

function UserDetailsTooltip(props){
    const { avatarSource, name, handle, children } = props

    return (
        <Tooltip
            renderTooltipContent={()=> (
                    <View style={styles.alignItemsCenter}>
                        <Avatar
                            containerStyles={[styles.actionAvatar]}
                            source={avatarSource}
                        />
                        {Boolean(name.trim()) ? <Text>{name}</Text> : ''}
                        {Boolean(handle.trim()) ? <Text>@{handle}</Text> : ''}
                    </View>
                )}
        >{children}</Tooltip>
    )
}

UserDetailsTooltip.propTypes = propTypes
UserDetailsTooltip.defaultProps = defaultProps
UserDetailsTooltip.displayName = 'UserDetailsTooltip'

export default UserDetailsTooltip;
