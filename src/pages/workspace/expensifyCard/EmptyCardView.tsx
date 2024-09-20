import React from 'react';
import {View} from 'react-native';
import EmptyStateComponent from '@components/EmptyStateComponent';
import * as Illustrations from '@components/Icon/Illustrations';
import ScrollView from '@components/ScrollView';
import CardRowSkeleton from '@components/Skeletons/CardRowSkeleton';
import Text from '@components/Text';
import useEmptyViewHeaderHeight from '@hooks/useEmptyViewHeaderHeight';
import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
import colors from '@styles/theme/colors';
import CONST from '@src/CONST';

type EmptyCardViewProps = {
    /** Title of the empty state */
    title: string;

    /** Subtitle of the empty state */
    subtitle: string;

    /** Whether the header buttons be displayed */
    areHeaderButtonsDisplayed: boolean;
};

function EmptyCardView({title, subtitle, areHeaderButtonsDisplayed}: EmptyCardViewProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const {windowHeight} = useWindowDimensions();
    const {shouldUseNarrowLayout} = useResponsiveLayout();

    const headerHeight = useEmptyViewHeaderHeight(shouldUseNarrowLayout, areHeaderButtonsDisplayed);

    return (
        <ScrollView>
            <View style={[{height: windowHeight - headerHeight}, styles.pt5]}>
                <EmptyStateComponent
                    SkeletonComponent={CardRowSkeleton}
                    headerMediaType={CONST.EMPTY_STATE_MEDIA.ILLUSTRATION}
                    headerMedia={Illustrations.EmptyCardState}
                    headerStyles={[
                        {
                            overflow: 'hidden',
                            backgroundColor: colors.green700,
                        },
                        shouldUseNarrowLayout && {maxHeight: 250},
                    ]}
                    title={title}
                    subtitle={subtitle}
                    minModalHeight={500}
                />
            </View>
            <Text style={[styles.textMicroSupporting, styles.m5]}>{translate('workspace.expensifyCard.disclaimer')}</Text>
        </ScrollView>
    );
}

EmptyCardView.displayName = 'EmptyCardView';

export default EmptyCardView;
