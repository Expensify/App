import React from 'react';
import {View} from 'react-native';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import variables from '@styles/variables';
import type {TranslationPaths} from '@src/languages/types';
import type IconAsset from '@src/types/utils/IconAsset';
import Icon from './Icon';
import * as Illustrations from './Icon/Illustrations';
import Text from './Text';

type HoldMenuSection = {
    /** The icon supplied with the section */
    icon: IconAsset;

    /** Translation key for the title */
    titleTranslationKey: TranslationPaths;
};

const holdMenuSections: HoldMenuSection[] = [
    {
        icon: Illustrations.Stopwatch,
        titleTranslationKey: 'iou.holdIsLeftBehind',
    },
    {
        icon: Illustrations.RealtimeReport,
        titleTranslationKey: 'iou.unholdWhenReady',
    },
];

function HoldMenuSectionList() {
    const {translate} = useLocalize();
    const styles = useThemeStyles();

    return (
        <>
            {holdMenuSections.map((section) => (
                <View
                    key={section.titleTranslationKey}
                    style={[styles.flexRow, styles.alignItemsCenter, styles.mt5]}
                >
                    <Icon
                        width={variables.menuIconSize}
                        height={variables.menuIconSize}
                        src={section.icon}
                        additionalStyles={[styles.mr4]}
                    />
                    <View style={[styles.flex1, styles.justifyContentCenter]}>
                        <Text style={[styles.textStrong, styles.mb1]}>{translate(section.titleTranslationKey)}</Text>
                    </View>
                </View>
            ))}
        </>
    );
}

HoldMenuSectionList.displayName = 'HoldMenuSectionList';

export default HoldMenuSectionList;
