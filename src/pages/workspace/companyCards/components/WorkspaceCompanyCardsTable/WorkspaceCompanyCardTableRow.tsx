import React from 'react';
import {View} from 'react-native';
import Avatar from '@components/Avatar';
import Button from '@components/Button';
import Icon from '@components/Icon';
import * as Expensicons from '@components/Icon/Expensicons';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import {getDisplayNameOrDefault} from '@libs/PersonalDetailsUtils';
import {getDefaultAvatarURL} from '@libs/UserAvatarUtils';
import CONST from '@src/CONST';
import type {PersonalDetails} from '@src/types/onyx';

type WorkspaceCompanyCardsTableRowProps = {
    /** Card number */
    cardNumber: string;

    /** Card name */
    cardName: string;

    /** Cardholder personal details */
    cardholder?: PersonalDetails | null;

    /** Whether the list item is hovered */
    isHovered?: boolean;

    /** On assign card */
    onAssignCard: () => void;
};

function WorkspaceCompanyCardsTableRow({cardholder, cardName: name, cardNumber, isHovered, onAssignCard}: WorkspaceCompanyCardsTableRowProps) {
    const styles = useThemeStyles();
    const theme = useTheme();
    const {translate} = useLocalize();

    const isAssigned = false;
    const cardName = name ?? getDisplayNameOrDefault(cardholder);

    return (
        <View style={[styles.flexRow, styles.gap3, styles.alignItemsCenter, styles.br3, styles.p4]}>
            <View style={[styles.flex1]}>
                {isAssigned ? (
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
                ) : (
                    <Text
                        numberOfLines={1}
                        style={[styles.optionDisplayName, styles.textStrong, styles.pre]}
                    >
                        Unassigned
                    </Text>
                )}
            </View>

            <View style={[styles.flex1]}>
                <Text
                    numberOfLines={1}
                    style={[styles.textLabelSupporting, styles.lh16]}
                >
                    {cardNumber}
                </Text>
            </View>

            <View style={[styles.flex1, styles.alignItemsEnd]}>
                {isAssigned ? (
                    <View style={[styles.justifyContentCenter, styles.alignItemsCenter, styles.ml2]}>
                        <Text
                            numberOfLines={1}
                            style={[styles.optionDisplayName, styles.textStrong, styles.pre]}
                        >
                            {cardName}
                        </Text>
                        <Icon
                            src={Expensicons.ArrowRight}
                            fill={theme.icon}
                            additionalStyles={[styles.alignSelfCenter, !isHovered && styles.opacitySemiTransparent]}
                            medium
                            isButtonIcon
                        />
                    </View>
                ) : (
                    <Button
                        text={translate('workspace.companyCards.assignCard')}
                        onPress={onAssignCard}
                    />
                )}
            </View>
        </View>
    );
}

WorkspaceCompanyCardsTableRow.displayName = 'WorkspaceCompanyCardsListRow';

export default WorkspaceCompanyCardsTableRow;
