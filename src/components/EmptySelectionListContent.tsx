import React from 'react';
import {View} from 'react-native';
import type {TupleToUnion} from 'type-fest';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import BlockingView from './BlockingViews/BlockingView';
import * as Illustrations from './Icon/Illustrations';
import ScrollView from './ScrollView';
import Text from './Text';

type EmptySelectionListContentProps = {
    /** Type of selection list */
    contentType: string;
};

const CONTENT_TYPES = [CONST.IOU.TYPE.CREATE, CONST.IOU.TYPE.SUBMIT];
type ContentType = TupleToUnion<typeof CONTENT_TYPES>;

function isContentType(contentType: unknown): contentType is ContentType {
    return CONTENT_TYPES.includes(contentType as ContentType);
}

function EmptySelectionListContent({contentType}: EmptySelectionListContentProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    if (!isContentType(contentType)) {
        return null;
    }
    const translationKeyContentType = CONST.IOU.TYPE.CREATE;
    const EmptySubtitle = <Text style={[styles.textAlignCenter]}>{translate(`emptyList.${translationKeyContentType}.subtitleText`)}</Text>;

    return (
        <ScrollView contentContainerStyle={[styles.flexGrow1]}>
            <View style={[styles.flex1, styles.overflowHidden, styles.minHeight65]}>
                <BlockingView
                    icon={Illustrations.ToddWithPhones}
                    iconWidth={variables.emptySelectionListIconWidth}
                    iconHeight={variables.emptySelectionListIconHeight}
                    title={translate(`emptyList.${translationKeyContentType}.title`)}
                    shouldShowLink={false}
                    CustomSubtitle={EmptySubtitle}
                    containerStyle={[styles.mb8, styles.ph15]}
                />
            </View>
        </ScrollView>
    );
}

EmptySelectionListContent.displayName = 'EmptySelectionListContent';

export default EmptySelectionListContent;
