import React from 'react';
import {View} from 'react-native';
import {SvgProps} from 'react-native-svg';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import variables from '@styles/variables';
import {TranslationPaths} from '@src/languages/types';
import Icon from './Icon';
import Text from './Text';

type HoldMenuSection = {
    /** The icon supplied with the section */
    icon: React.FC<SvgProps>;

    /** Translation key for the title */
    titleTranslationKey: TranslationPaths;

    /** Translation key for the description */
    descriptionTranslationKey: TranslationPaths;
};

type HoldMenuSelectionListProps = {
    /** Array of sections with an icon, title and a description */
    holdMenuSections: HoldMenuSection[];
};

function HoldMenuSectionList({holdMenuSections}: HoldMenuSelectionListProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();

    return (
        <>
            {holdMenuSections.map((section) => (
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

export type {HoldMenuSection};

export default HoldMenuSectionList;
