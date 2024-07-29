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
import colors from '@styles/theme/colors';
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
            <View style={[{height: windowHeight - headerHeight}, styles.mt5]}>
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
                    emptyStateForegroundStyles={isSmallScreenWidth && {justifyContent: 'flex-start'}}
                />
            </View>
            <Text style={[styles.textMicroSupporting, styles.m5]}>{translate('workspace.expensifyCard.disclaimer')}</Text>
        </ScrollView>
    );
}

EmptyCardView.displayName = 'EmptyCardView';

export default EmptyCardView;
