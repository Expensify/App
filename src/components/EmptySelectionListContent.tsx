import React from 'react';
import {View} from 'react-native';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import variables from '@styles/variables';
import type {IOUType} from '@src/CONST';
import BlockingView from './BlockingViews/BlockingView';
import * as Illustrations from './Icon/Illustrations';

type EmptySelectionListContentProps = {
    content: IOUType | 'startChat' | 'assignTask';
};

function EmptySelectionListContent({content}: EmptySelectionListContentProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    return (
        <View style={[styles.flex1, styles.overflowHidden]}>
            <BlockingView
                icon={Illustrations.ToddWithPhones}
                iconWidth={variables.modalTopIconWidth}
                iconHeight={variables.modalTopMediumIconHeight}
                title={translate(`emptyList.${content}.title`)}
                shouldShowLink={false}
                subtitle={translate(`emptyList.${content}.subtitle`)}
            />
        </View>
    );
}

EmptySelectionListContent.displayName = 'EmptySelectionListContent';

export default EmptySelectionListContent;
