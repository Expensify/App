import React, {useMemo} from 'react';
import {View} from 'react-native';
import Avatar from '@components/Avatar';
import Icon from '@components/Icon';
import * as Expensicons from '@components/Icon/Expensicons';
import Text from '@components/Text';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import {getDisplayNameOrDefault} from '@libs/PersonalDetailsUtils';
import {getDefaultAvatarURL} from '@libs/UserAvatarUtils';
import CONST from '@src/CONST';
import type {PersonalDetails} from '@src/types/onyx';

type WorkspaceCompanyCardsListRowProps = {
    /** Card number */
    cardNumber: string;

    /** Card name */
    name: string;

    /** Cardholder personal details */
    cardholder?: PersonalDetails | null;

    /** Whether the list item is hovered */
    isHovered?: boolean;
};

function WorkspaceCompanyCardsListRow({cardholder, name, cardNumber, isHovered}: WorkspaceCompanyCardsListRowProps) {
    const styles = useThemeStyles();
    const cardholderName = useMemo(() => getDisplayNameOrDefault(cardholder), [cardholder]);
    const theme = useTheme();
    return (
        <View style={[styles.flexRow, styles.justifyContentBetween, styles.alignItemsCenter, styles.br3, styles.p4]}>
            <View style={[styles.flexRow, styles.gap3, styles.alignItemsCenter, styles.flex3]}>
                <Avatar
                    source={
                        cardholder?.avatar ??
                        getDefaultAvatarURL({
                            accountID: cardholder?.accountID,
                        })
                    }
                    avatarID={cardholder?.accountID}
                    type={CONST.ICON_TYPE_AVATAR}
                    size={CONST.AVATAR_SIZE.DEFAULT}
                />
                <View style={[styles.flex1, styles.pr2]}>
                    <Text
                        numberOfLines={1}
                        style={[styles.optionDisplayName, styles.textStrong, styles.pre]}
                    >
                        {cardholderName}
                    </Text>
                    <Text
                        numberOfLines={1}
                        style={[styles.textLabelSupporting, styles.lh16]}
                    >
                        {name}
                    </Text>
                </View>
            </View>
            <View style={[styles.flex1, styles.alignItemsEnd]}>
                <Text
                    numberOfLines={1}
                    style={[styles.textLabelSupporting, styles.lh16]}
                >
                    {cardNumber}
                </Text>
            </View>
            <View style={[styles.justifyContentCenter, styles.alignItemsCenter, styles.ml2]}>
                <Icon
                    src={Expensicons.ArrowRight}
                    fill={theme.icon}
                    additionalStyles={[styles.alignSelfCenter, !isHovered && styles.opacitySemiTransparent]}
                    medium
                    isButtonIcon
                />
            </View>
        </View>
    );
}

export default WorkspaceCompanyCardsListRow;
