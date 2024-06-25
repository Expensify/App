import React, {useMemo} from 'react';
import {View} from 'react-native';
import type {StyleProp, ViewStyle} from 'react-native';
import Avatar from '@components/Avatar';
import Badge from '@components/Badge';
import Text from '@components/Text';
import useThemeStyles from '@hooks/useThemeStyles';
import * as PersonalDetailsUtils from '@libs/PersonalDetailsUtils';
import {getDefaultAvatarURL} from '@libs/UserUtils';
import CONST from '@src/CONST';
import {PersonalDetails} from '@src/types/onyx';

type WorkspacesListRowProps = {
    /** Additional styles applied to the row */
    style: StyleProp<ViewStyle>;

    /** The last four digits of the card */
    lastFour: string;

    /** Card description */
    description: string;

    /** Cardholder personal details */
    cardholder: PersonalDetails;

    /** Card limit */
    limit: string;
};

function WorkspaceCardListRow({style, limit, cardholder, lastFour, description}: WorkspacesListRowProps) {
    const styles = useThemeStyles();

    const cardholderName = useMemo(() => PersonalDetailsUtils.getDisplayNameOrDefault(cardholder), [cardholder]);

    return (
        <View style={[styles.flexRow, styles.highlightBG, styles.mh5, styles.mb3, styles.gap5, styles.br3, styles.p4, style]}>
            <View style={[styles.flexRow, styles.flex5, styles.gap3, styles.alignItemsCenter]}>
                <Avatar
                    source={getDefaultAvatarURL(cardholder.accountID)}
                    avatarID={cardholder.accountID}
                    type={CONST.ICON_TYPE_AVATAR}
                    size={CONST.AVATAR_SIZE.DEFAULT}
                />
                <View style={styles.flex1}>
                    <Text
                        numberOfLines={1}
                        style={[styles.optionDisplayName, styles.sidebarLinkTextBold, styles.pre]}
                    >
                        {cardholderName}
                    </Text>
                    <Text
                        numberOfLines={1}
                        style={[styles.textLabelSupporting, styles.lh16]}
                    >
                        {description}
                    </Text>
                </View>
            </View>
            <View style={[styles.flexRow, styles.gap2, styles.flex1, styles.alignItemsCenter, styles.justifyContentEnd]}>
                <Text
                    numberOfLines={1}
                    style={[styles.textLabelSupporting, styles.lh16]}
                >
                    {lastFour}
                </Text>
            </View>
            <View style={[styles.flexRow, styles.flex1, styles.gap2, styles.alignItemsCenter, styles.justifyContentEnd]}>
                <Badge text={limit} />
            </View>
        </View>
    );
}

WorkspaceCardListRow.displayName = 'WorkspaceCardListRow';

export default WorkspaceCardListRow;
