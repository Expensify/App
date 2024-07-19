import React from 'react';
import {View} from 'react-native';
import EmptyStateComponent from '@components/EmptyStateComponent';
import * as Illustrations from '@components/Icon/Illustrations';
import ScrollView from '@components/ScrollView';
import CardRowSkeleton from '@components/Skeletons/CardRowSkeleton';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
import CONST from '@src/CONST';

const HEADER_HEIGHT = 80;
const BUTTON_HEIGHT = 40;
const BUTTON_MARGIN = 12;

function EmptyCardView() {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const {windowHeight, isSmallScreenWidth} = useWindowDimensions();

    const headerHeight = isSmallScreenWidth ? HEADER_HEIGHT + BUTTON_HEIGHT + BUTTON_MARGIN : HEADER_HEIGHT;

    return (
        <ScrollView>
            <View style={{height: windowHeight - headerHeight}}>
                <EmptyStateComponent
                    SkeletonComponent={CardRowSkeleton}
                    headerMediaType={CONST.EMPTY_STATE_MEDIA.ILLUSTRATION}
                    headerMedia={Illustrations.EmptyCardState}
                    headerStyles={[{overflow: 'hidden'}, isSmallScreenWidth && {maxHeight: 300}]}
                    title={translate('workspace.expensifyCard.issueAndManageCards')}
                    subtitle={translate('workspace.expensifyCard.getStartedIssuing')}
                    emptyStateContentStyles={isSmallScreenWidth ? {top: -BUTTON_HEIGHT} : undefined}
                />
            </View>
            <Text style={[styles.textMicroSupporting, styles.m5]}>{translate('workspace.expensifyCard.disclaimer')}</Text>
        </ScrollView>
    );
}

EmptyCardView.displayName = 'EmptyCardView';

export default EmptyCardView;
