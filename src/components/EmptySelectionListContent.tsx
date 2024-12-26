import React from 'react';
import {View} from 'react-native';
import type {TupleToUnion} from 'type-fest';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import BlockingView from './BlockingViews/BlockingView';
import * as Illustrations from './Icon/Illustrations';
import ScrollView from './ScrollView';
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
            <TextLink
                onPress={() => {
                    Navigation.navigate(ROUTES.REFERRAL_DETAILS_MODAL.getRoute(CONST.REFERRAL_PROGRAM.CONTENT_TYPES.SUBMIT_EXPENSE, Navigation.getActiveRouteWithoutParams()));
                }}
            >
                {translate(`emptyList.${contentType}.subtitleText2`)}
            </TextLink>
            {translate(`emptyList.${contentType}.subtitleText3`)}
        </Text>
    );

    return (
        <ScrollView contentContainerStyle={[styles.flexGrow1]}>
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
        </ScrollView>
    );
}

EmptySelectionListContent.displayName = 'EmptySelectionListContent';

export default EmptySelectionListContent;
