import React from 'react';
import {View} from 'react-native';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import convertToLTR from '@libs/convertToLTR';
import variables from '@styles/variables';
import type {TranslationPaths} from '@src/languages/types';
import type IconAsset from '@src/types/utils/IconAsset';
import Icon from './Icon';
import * as Illustrations from './Icon/Illustrations';
import RenderHTML from './RenderHTML';

type ChangeWorkspaceMenuSection = {
    /** The icon supplied with the section */
    icon: IconAsset;

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
            {changeWorkspaceMenuSections.map((section) => (
                <View
                    key={section.titleTranslationKey}
                    style={[styles.flexRow, styles.alignItemsCenter, styles.mt3]}
                >
                    <Icon
                        width={variables.menuIconSize}
                        height={variables.menuIconSize}
                        src={section.icon}
                        additionalStyles={[styles.mr4]}
                    />
                    <View style={[styles.flex1, styles.flexRow, styles.justifyContentCenter, styles.alignItemsCenter, styles.wAuto]}>
                        <RenderHTML html={`<comment>${convertToLTR(translate(section.titleTranslationKey))}</comment>`} />
                    </View>
                </View>
            ))}
        </>
    );
}

ChangeWorkspaceMenuSectionList.displayName = 'ChangeWorkspaceMenuSectionList';
export default ChangeWorkspaceMenuSectionList;
