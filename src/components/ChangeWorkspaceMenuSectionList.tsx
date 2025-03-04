import React from 'react';
import {View} from 'react-native';
import type {ImageSourcePropType} from 'react-native';
import type {SvgProps} from 'react-native-svg';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import convertToLTR from '@libs/convertToLTR';
import variables from '@styles/variables';
import type {TranslationPaths} from '@src/languages/types';
import Icon from './Icon';
import * as Illustrations from './Icon/Illustrations';
import RenderHTML from './RenderHTML';

type ChangeWorkspaceMenuSection = {
    /** The icon supplied with the section */
    icon: React.FC<SvgProps> | ImageSourcePropType;

    /** Translation key for the title */
    titleTranslationKey: TranslationPaths;
};

const changeWorkspaceMenuSections: ChangeWorkspaceMenuSection[] = [
    {
        icon: Illustrations.FolderOpen,
        titleTranslationKey: 'iou.changePolicyEducational.reCategorize',
    },
    {
        icon: Illustrations.Workflows,
        titleTranslationKey: 'iou.changePolicyEducational.workflows',
    },
];

function ChangeWorkspaceMenuSectionList() {
    const {translate} = useLocalize();
    const styles = useThemeStyles();

    return (
        <>
            {changeWorkspaceMenuSections.map((section, i) => (
                <View
                    // eslint-disable-next-line react/no-array-index-key
                    key={`${i}-${section.titleTranslationKey}`}
                    style={[styles.flexRow, styles.alignItemsCenter, styles.mt5]}
                >
                    <Icon
                        width={variables.menuIconSize}
                        height={variables.menuIconSize}
                        src={section.icon}
                        additionalStyles={[styles.mr4]}
                    />
                    <View style={[styles.flex1, styles.justifyContentCenter]}>
                        <RenderHTML html={`<comment>${convertToLTR(translate(section.titleTranslationKey))}</comment>`} />
                    </View>
                </View>
            ))}
        </>
    );
}

ChangeWorkspaceMenuSectionList.displayName = 'ChangeWorkspaceMenuSectionList';

export type {ChangeWorkspaceMenuSection};

export default ChangeWorkspaceMenuSectionList;
