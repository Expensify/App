import React, {useMemo} from 'react';
import {View} from 'react-native';
import Avatar from '@components/Avatar';
import Badge from '@components/Badge';
import {FallbackAvatar} from '@components/Icon/Expensicons';
import Text from '@components/Text';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import * as CurrencyUtils from '@libs/CurrencyUtils';
import * as PersonalDetailsUtils from '@libs/PersonalDetailsUtils';
import CONST from '@src/CONST';
import type {PersonalDetails} from '@src/types/onyx';

type WorkspacesListRowProps = {
    /** The last four digits of the card */
    lastFourPAN: string;

    /** Card name */
    name: string;

    /** Cardholder personal details */
    cardholder?: PersonalDetails | null;

    /** Card limit */
    limit: number;

    /** Policy currency */
    currency: string;
};

function WorkspaceCardListRow({limit, cardholder, lastFourPAN, name, currency}: WorkspacesListRowProps) {
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const styles = useThemeStyles();

    const cardholderName = useMemo(() => PersonalDetailsUtils.getDisplayNameOrDefault(cardholder), [cardholder]);

    return (
        <View style={[styles.flexRow, styles.gap5, styles.br3, styles.p4]}>
            <View style={[styles.flexRow, styles.flex5, styles.gap3, styles.alignItemsCenter]}>
                <Avatar
                    source={cardholder?.avatar ?? FallbackAvatar}
                    avatarID={cardholder?.accountID}
                    type={CONST.ICON_TYPE_AVATAR}
                    size={CONST.AVATAR_SIZE.DEFAULT}
                />
                <View style={styles.flex1}>
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
            <View style={[styles.flexRow, styles.gap2, shouldUseNarrowLayout ? styles.flex2 : styles.flex1, styles.alignItemsCenter, styles.justifyContentEnd]}>
                <Text
                    numberOfLines={1}
                    style={[styles.textLabelSupporting, styles.lh16]}
                >
                    {lastFourPAN}
                </Text>
            </View>
            <View style={[styles.flexRow, shouldUseNarrowLayout ? styles.flex3 : styles.flex1, styles.gap2, styles.alignItemsCenter, styles.justifyContentEnd]}>
                <Badge text={CurrencyUtils.convertToDisplayString(limit, currency)} />
            </View>
        </View>
    );
}

WorkspaceCardListRow.displayName = 'WorkspaceCardListRow';

export default WorkspaceCardListRow;
