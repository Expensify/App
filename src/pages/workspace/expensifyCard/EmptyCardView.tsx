import React from 'react';
import {View} from 'react-native';
import EmptyStateComponent from '@components/EmptyStateComponent';
import * as Illustrations from '@components/Icon/Illustrations';
import ScrollView from '@components/ScrollView';
import CardRowSkeleton from '@components/Skeletons/CardRowSkeleton';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useSafeAreaInsets from '@hooks/useSafeAreaInsets';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
import getPlatform from '@libs/getPlatform';
import colors from '@styles/theme/colors';
import CONST from '@src/CONST';

const HEADER_HEIGHT = 80;
const BUTTON_HEIGHT = 40;
const BUTTON_MARGIN = 12;

const isIOSNative = getPlatform() === CONST.PLATFORM.IOS;

function EmptyCardView() {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const {windowHeight, isSmallScreenWidth} = useWindowDimensions();

    const safeAreaInsets = useSafeAreaInsets();
    const headerHeight = isSmallScreenWidth ? HEADER_HEIGHT + BUTTON_HEIGHT + BUTTON_MARGIN + (isIOSNative ? safeAreaInsets.top : 0) : HEADER_HEIGHT;

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
                        isSmallScreenWidth && {maxHeight: 250},
                    ]}
                    title={translate('workspace.expensifyCard.issueAndManageCards')}
                    subtitle={translate('workspace.expensifyCard.getStartedIssuing')}
                />
            </View>
            <Text style={[styles.textMicroSupporting, styles.m5]}>{translate('workspace.expensifyCard.disclaimer')}</Text>
        </ScrollView>
    );
}

EmptyCardView.displayName = 'EmptyCardView';

export default EmptyCardView;
