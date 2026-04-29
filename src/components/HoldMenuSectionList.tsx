import React from 'react';
import {View} from 'react-native';
import {useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import variables from '@styles/variables';
import type {TranslationPaths} from '@src/languages/types';
import type IconAsset from '@src/types/utils/IconAsset';
import Icon from './Icon';
import Text from './Text';

type HoldMenuSection = {
    /** The icon supplied with the section */
    icon: IconAsset;

    /** Translation key for the title */
    titleTranslationKey: TranslationPaths;
};

type HoldMenuSectionListProps = {
    /** Whether the expense is from a DM (direct message) report */
    isDM?: boolean;
};

function HoldMenuSectionList({isDM}: HoldMenuSectionListProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const illustrations = useMemoizedLazyIllustrations(['RealtimeReport', 'Stopwatch']);
    const holdMenuSections: HoldMenuSection[] = [
        {
            icon: illustrations.Stopwatch,
            titleTranslationKey: isDM ? 'iou.holdIsLeftBehindDM' : 'iou.holdIsLeftBehind',
        },
        {
            icon: illustrations.RealtimeReport,
            titleTranslationKey: isDM ? 'iou.unholdWhenReadyDM' : 'iou.unholdWhenReady',
        },
    ];

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

export default HoldMenuSectionList;
