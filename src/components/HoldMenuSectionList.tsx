import React from 'react';
import {View} from 'react-native';
import type {ImageSourcePropType} from 'react-native';
import type {SvgProps} from 'react-native-svg';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import variables from '@styles/variables';
import type {TranslationPaths} from '@src/languages/types';
import Icon from './Icon';
import * as Illustrations from './Icon/Illustrations';
import Text from './Text';

type HoldMenuSection = {
    /** The icon supplied with the section */
    icon: React.FC<SvgProps> | ImageSourcePropType;

    /** Translation key for the title */
    titleTranslationKey: TranslationPaths;

    /** Translation key for the description */
    descriptionTranslationKey: TranslationPaths;
};

function HoldMenuSectionList() {
    const {translate} = useLocalize();
    const styles = useThemeStyles();

    const holdMenuSections: HoldMenuSection[] = [
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
            {holdMenuSections.map((section, i) => (
                <View
                    // eslint-disable-next-line react/no-array-index-key
                    key={i}
                    style={[styles.flexRow, styles.alignItemsCenter, styles.mb5]}
                >
                    <Icon
                        width={variables.holdMenuIconSize}
                        height={variables.holdMenuIconSize}
                        src={section.icon}
                        additionalStyles={[styles.mr3]}
                    />
                    <View style={[styles.flex1, styles.justifyContentCenter]}>
                        <Text style={[styles.textStrong, styles.mb1]}>{translate(section.titleTranslationKey)}</Text>
                        <Text style={[styles.textNormal]}>{translate(section.descriptionTranslationKey)}</Text>
                    </View>
                </View>
            ))}
        </>
    );
}

HoldMenuSectionList.displayName = 'HoldMenuSectionList';

export type {HoldMenuSection};

export default HoldMenuSectionList;
