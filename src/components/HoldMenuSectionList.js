import _ from 'lodash';
import React from 'react';
import {View} from 'react-native';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@styles/useThemeStyles';
import variables from '@styles/variables';
import Icon from './Icon';
import * as Illustrations from './Icon/Illustrations';

function HoldMenuSectionList() {
    const {translate} = useLocalize();
    const styles = useThemeStyles();

    const holdMenuSections = [
        {
            icon: Illustrations.Hourglass,
            titleTranslationKey: 'iou.whatIsHoldTitle',
            descriptionTranslationKey: 'iou.whatIsHoldExplain',
        },
        {
            icon: Illustrations.CommentBubbles,
            titleTranslationKey: 'iou.holdIsTemporaryTitle',
            descriptionTranslationKey: 'iou.holdIsTemporaryExplain',
        },
        {
            icon: Illustrations.TrashCan,
            titleTranslationKey: 'iou.deleteHoldTitle',
            descriptionTranslationKey: 'iou.deleteHoldExplain',
        },
    ];

    return (
        <>
            {_.map(holdMenuSections, (section) => (
                <View style={[styles.flexRow, styles.alignItemsCenter, styles.mb5]}>
                    <Icon
                        width={variables.holdMenuIconSize}
                        height={variables.holdMenuIconSize}
                        src={section.icon}
                        additionalStyles={[styles.mr3]}
                    />
                    <View style={[styles.flex1, styles.justifyContentCenter]}>
                        <Text style={[styles.textStrong, styles.mb1]}>{translate(section.titleTranslationKey)}</Text>
                        <Text
                            style={[styles.textNormal]}
                            numberOfLines={3}
                        >
                            {translate(section.descriptionTranslationKey)}
                        </Text>
                    </View>
                </View>
            ))}
        </>
    );
}

HoldMenuSectionList.displayName = 'HoldMenuSectionList';

export default HoldMenuSectionList;
