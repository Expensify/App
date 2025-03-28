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
    /** Whether the bank account is verified */
    isBankAccountVerified: boolean;
};

function EmptyCardView({isBankAccountVerified}: EmptyCardViewProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const {windowHeight} = useWindowDimensions();
    const {shouldUseNarrowLayout} = useResponsiveLayout();

    const headerHeight = useEmptyViewHeaderHeight(shouldUseNarrowLayout, isBankAccountVerified);

    return (
        <ScrollView contentContainerStyle={[styles.flexGrow1, styles.flexShrink0]}>
            <View style={[{height: windowHeight - headerHeight}, styles.pt5]}>
                <EmptyStateComponent
                    SkeletonComponent={CardRowSkeleton}
                    headerMediaType={CONST.EMPTY_STATE_MEDIA.ILLUSTRATION}
                    headerMedia={isBankAccountVerified ? Illustrations.EmptyCardState : Illustrations.CompanyCardsPendingState}
                    headerStyles={
                        isBankAccountVerified
                            ? [
                                  {
                                      overflow: 'hidden',
                                      backgroundColor: colors.green700,
                                  },
                                  shouldUseNarrowLayout && {maxHeight: 250},
                              ]
                            : [styles.emptyStateCardIllustrationContainer, {backgroundColor: colors.ice800}]
                    }
                    title={translate(`workspace.expensifyCard.${isBankAccountVerified ? 'issueAndManageCards' : 'verificationInProgress'}`)}
                    subtitle={translate(`workspace.expensifyCard.${isBankAccountVerified ? 'getStartedIssuing' : 'verifyingTheDetails'}`)}
                    headerContentStyles={isBankAccountVerified ? null : styles.pendingStateCardIllustration}
                    minModalHeight={isBankAccountVerified ? 500 : 400}
                />
            </View>
            <Text style={[styles.textMicroSupporting, styles.m5]}>{translate('workspace.expensifyCard.disclaimer')}</Text>
        </ScrollView>
    );
}

EmptyCardView.displayName = 'EmptyCardView';

export default EmptyCardView;
