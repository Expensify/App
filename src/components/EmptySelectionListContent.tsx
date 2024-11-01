import React from 'react';
import {View} from 'react-native';
import type {TupleToUnion} from 'type-fest';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import BlockingView from './BlockingViews/BlockingView';
import * as Illustrations from './Icon/Illustrations';
import Text from './Text';
import TextLink from './TextLink';

type EmptySelectionListContentProps = {
    /** Type of selection list */
    contentType: string;
};

const CONTENT_TYPES = [CONST.IOU.TYPE.SUBMIT, CONST.IOU.TYPE.SPLIT, CONST.IOU.TYPE.PAY];
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

    const EmptySubtitle = (
        <Text style={[styles.textAlignCenter]}>
            {translate(`emptyList.${contentType}.subtitleText1`)}
            <TextLink href={CONST.REFERRAL_PROGRAM.LEARN_MORE_LINK}>{translate(`emptyList.${contentType}.subtitleText2`)}</TextLink>
            {translate(`emptyList.${contentType}.subtitleText3`)}
        </Text>
    );

    return (
        <View style={[styles.flex1, styles.overflowHidden, styles.minHeight65]}>
            <BlockingView
                icon={Illustrations.ToddWithPhones}
                iconWidth={variables.emptySelectionListIconWidth}
                iconHeight={variables.emptySelectionListIconHeight}
                title={translate(`emptyList.${contentType}.title`)}
                shouldShowLink={false}
                CustomSubtitle={EmptySubtitle}
                containerStyle={[styles.mb8, styles.ph15]}
            />
        </View>
    );
}

EmptySelectionListContent.displayName = 'EmptySelectionListContent';

export default EmptySelectionListContent;
