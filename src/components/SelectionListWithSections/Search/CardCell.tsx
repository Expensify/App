import React from 'react';
import type { ColorValue} from 'react-native';
import {View} from 'react-native';
import ReportActionAvatars from '@components/ReportActionAvatars';
import TextWithTooltip from '@components/TextWithTooltip';
import useThemeStyles from '@hooks/useThemeStyles';
import CONST from '@src/CONST';
import type {CompanyCardFeed} from '@src/types/onyx/CardFeeds';

type CardCellProps = {
    /** Account ID */
    accountID: number;

    /** Card feed/bank */
    bank: CompanyCardFeed;

    /** Background color for the subscript avatar border */
    backgroundColor?: ColorValue;

    /** Display name */
    displayName: string;

    /** Card name */
    cardName: string;

    /** Last four digits of PAN */
    lastFourPAN: string;
};

function CardCell({accountID, bank, backgroundColor, displayName, cardName, lastFourPAN}: CardCellProps) {
    const styles = useThemeStyles();

    return (
        <View style={[styles.flexRow, styles.flex1, styles.gap3]}>
            <ReportActionAvatars
                subscriptCardFeed={bank}
                subscriptAvatarBorderColor={backgroundColor}
                noRightMarginOnSubscriptContainer
                accountIDs={[accountID]}
            />
            <View style={[styles.gapHalf, styles.flexShrink1]}>
                <TextWithTooltip
                    text={displayName}
                    style={[styles.optionDisplayName, styles.sidebarLinkTextBold, styles.pre, styles.fontWeightNormal]}
                />
                <TextWithTooltip
                    text={`${cardName}${lastFourPAN ? ` ${CONST.DOT_SEPARATOR} ` : ''}${lastFourPAN}`}
                    style={[styles.textLabelSupporting, styles.lh16, styles.pre]}
                />
            </View>
        </View>
    );
}

CardCell.displayName = 'CardCell';

export default CardCell;
