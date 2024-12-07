import React, {useMemo} from 'react';
import {View} from 'react-native';
import Avatar from '@components/Avatar';
import {FallbackAvatar} from '@components/Icon/Expensicons';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
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

    /** Type of card */
    isVirtual: boolean;
};

function WorkspaceCardListRow({limit, cardholder, lastFourPAN, name, currency, isVirtual}: WorkspacesListRowProps) {
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    const cardholderName = useMemo(() => PersonalDetailsUtils.getDisplayNameOrDefault(cardholder), [cardholder]);
    const cardType = isVirtual ? translate('workspace.expensifyCard.virtual') : translate('workspace.expensifyCard.physical');
    return (
        <View style={[styles.flexRow, styles.gap3, styles.br3, styles.p4]}>
            <View style={[styles.flexRow, styles.flex4, styles.gap3, styles.alignItemsCenter]}>
                <Avatar
                    source={cardholder?.avatar ?? FallbackAvatar}
                    avatarID={cardholder?.accountID}
                    type={CONST.ICON_TYPE_AVATAR}
                    size={CONST.AVATAR_SIZE.DEFAULT}
                />
                <View style={[styles.flex1, styles.h100]}>
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
            {!shouldUseNarrowLayout && (
                <View style={[styles.flexRow, styles.gap2, styles.flex1, styles.alignItemsCenter, styles.justifyContentStart]}>
                    <Text
                        numberOfLines={1}
                        style={[styles.textNormalThemeText, styles.lh16]}
                    >
                        {cardType}
                    </Text>
                </View>
            )}
            <View
                style={[
                    styles.flexRow,
                    styles.gap2,
                    shouldUseNarrowLayout ? styles.flex2 : styles.flex1,
                    shouldUseNarrowLayout ? styles.alignItemsStart : styles.alignItemsCenter,
                    shouldUseNarrowLayout ? styles.justifyContentCenter : styles.justifyContentStart,
                ]}
            >
                <Text
                    numberOfLines={1}
                    style={[styles.textNormalThemeText]}
                >
                    {lastFourPAN}
                </Text>
            </View>
            <View
                style={[
                    !shouldUseNarrowLayout ? styles.flexRow : styles.flexColumn,
                    shouldUseNarrowLayout ? styles.flex3 : styles.flex1,
                    !shouldUseNarrowLayout && styles.gap2,
                    !shouldUseNarrowLayout ? styles.alignItemsCenter : styles.alignItemsEnd,
                    shouldUseNarrowLayout ? styles.justifyContentStart : styles.justifyContentEnd,
                ]}
            >
                <Text
                    numberOfLines={1}
                    style={[styles.textNormalThemeText]}
                >
                    {CurrencyUtils.convertToShortDisplayString(limit, currency)}
                </Text>
                {shouldUseNarrowLayout && (
                    <Text
                        numberOfLines={1}
                        style={[styles.textLabelSupporting, styles.lh16]}
                    >
                        {cardType}
                    </Text>
                )}
            </View>
        </View>
    );
}

WorkspaceCardListRow.displayName = 'WorkspaceCardListRow';

export default WorkspaceCardListRow;
