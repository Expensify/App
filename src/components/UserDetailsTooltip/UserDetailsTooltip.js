import React from 'react';
import { View, Text } from 'react-native';
import Avatar from '../Avatar';
import Tooltip from '../Tooltip';
import { propTypes, defaultProps } from './userDetailsTooltipPropTypes';
import styles from '../../styles/styles';

function UserDetailsTooltip(props){
    return (
        <Tooltip
            renderTooltipContent={()=> (
                    <View style={styles.alignItemsCenter}>
                        <Avatar
                            containerStyles={[styles.actionAvatar]}
                            source={props.avatarSource}
                        />
                        {Boolean(props.name.trim()) ? <Text>{props.name}</Text> : ''}
                        {Boolean(props.handle.trim()) ? <Text>@{props.handle}</Text> : ''}
                    </View>
                )}
        >{props.children}</Tooltip>
    )
}

UserDetailsTooltip.propTypes = propTypes
UserDetailsTooltip.defaultProps = defaultProps
UserDetailsTooltip.displayName = 'UserDetailsTooltip'

export default UserDetailsTooltip;
