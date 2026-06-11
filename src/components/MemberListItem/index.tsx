import React from 'react';
import {View, Text} from 'react-native';
import Tooltip from '@components/Tooltip';
import Hoverable from '@components/Hoverable';
import styles from '@styles/styles';
import {MemberListItemProps} from './types';
import * as UserUtils from '@libs/UserUtils';

function MemberListItem({
    member,
    isDisabled,
    shouldShowTooltip,
    onPress,
}: MemberListItemProps) {
    const displayName = UserUtils.getDisplayName(member);
    const email = member.login;

    // The fix: Ensure the Tooltip is rendered when shouldShowTooltip is true
    // and wrap the text content correctly.
    const content = (
        <View style={[styles.flexRow, styles.alignItemsCenter]}>
            <Text style={styles.optionDisplayName}>{displayName}</Text>
            {email && (
                <Text style={[styles.optionAlternateText, styles.ml2]}>
                    {email}
                </Text>
            )}
        </View>
    );

    // If shouldShowTooltip is true, wrap the content in a Tooltip
    // The Tooltip component in Expensify usually handles the hover logic internally
    // but sometimes needs explicit shouldRender prop for web.
    if (shouldShowTooltip) {
        return (
            <Tooltip text={email || displayName}>
                <View style={[styles.flexRow, styles.alignItemsCenter, styles.pointerEventsBoxNone]}>
                    {content}
                </View>
            </Tooltip>
        );
    }

    return (
        <View style={[styles.flexRow, styles.alignItemsCenter]}>
            {content}
        </View>
    );
}

export default MemberListItem;