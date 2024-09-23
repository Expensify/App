import React, {useMemo} from 'react';
import {View} from 'react-native';
import Avatar from '@components/Avatar';
import Text from '@components/Text';
import useThemeStyles from '@hooks/useThemeStyles';
import * as PersonalDetailsUtils from '@libs/PersonalDetailsUtils';
import {getDefaultAvatarURL} from '@libs/UserUtils';
import CONST from '@src/CONST';
import type {PersonalDetails} from '@src/types/onyx';

type WorkspaceCompanyCardsListRowProps = {
    /** Card number */
    cardNumber: string;

    /** Card name */
    name: string;

    /** Cardholder personal details */
    cardholder?: PersonalDetails | null;
};

function WorkspaceCompanyCardsListRow({cardholder, name, cardNumber}: WorkspaceCompanyCardsListRowProps) {
    const styles = useThemeStyles();
    const cardholderName = useMemo(() => PersonalDetailsUtils.getDisplayNameOrDefault(cardholder), [cardholder]);

    return (
        <View style={[styles.flexRow, styles.justifyContentBetween, styles.alignItemsCenter, styles.br3, styles.p4]}>
            <View style={[styles.flexRow, styles.gap3, styles.alignItemsCenter]}>
                <Avatar
                    source={getDefaultAvatarURL(cardholder?.accountID)}
                    avatarID={cardholder?.accountID}
                    type={CONST.ICON_TYPE_AVATAR}
                    size={CONST.AVATAR_SIZE.DEFAULT}
                />
                <View>
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
            <Text
                numberOfLines={1}
                style={[styles.textLabelSupporting, styles.lh16]}
            >
                {cardNumber}
            </Text>
        </View>
    );
}

WorkspaceCompanyCardsListRow.displayName = 'WorkspaceCompanyCardsListRow';

export default WorkspaceCompanyCardsListRow;
