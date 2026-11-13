import {useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

import variables from '@styles/variables';

import CONST from '@src/CONST';

import React from 'react';
import {View} from 'react-native';

import BlockingView from './BlockingViews/BlockingView';
import ScrollView from './ScrollView';
import Text from './Text';

type EmptySelectionListContentProps = {
    contentType: string;
};

function EmptySelectionListContent({contentType}: EmptySelectionListContentProps) {
    const styles = useThemeStyles();
    const illustrations = useMemoizedLazyIllustrations(['ToddWithPhones']);
    const {translate} = useLocalize();

    if (contentType !== CONST.IOU.TYPE.CREATE && contentType !== CONST.IOU.TYPE.SUBMIT) {
        return null;
    }
    const translationKeyContentType = CONST.IOU.TYPE.CREATE;
    const EmptySubtitle = <Text style={[styles.textAlignCenter]}>{translate(`emptyList.${translationKeyContentType}.subtitleText`)}</Text>;

    return (
        <ScrollView contentContainerStyle={[styles.flexGrow1]}>
            <View style={[styles.flex1, styles.overflowHidden, styles.minHeight65]}>
                <BlockingView
                    icon={illustrations.ToddWithPhones}
                    iconWidth={variables.emptySelectionListIconWidth}
                    iconHeight={variables.emptySelectionListIconHeight}
                    title={translate(`emptyList.${translationKeyContentType}.title`)}
                    CustomSubtitle={EmptySubtitle}
                    containerStyle={[styles.mb8, styles.ph15]}
                />
            </View>
        </ScrollView>
    );
}

export default EmptySelectionListContent;
