import React from 'react';
import EmptyStateComponent from '@components/EmptyStateComponent';
import * as Expensicons from '@components/Icon/Expensicons';
import * as Illustrations from '@components/Icon/Illustrations';
import ScrollView from '@components/ScrollView';
import CardRowSkeleton from '@components/Skeletons/CardRowSkeleton';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import colors from '@styles/theme/colors';
import CONST from '@src/CONST';

type WorkspaceCompanyCardsFeedAddedEmptyPageProps = {
    /** Handle assign card action */
    handleAssignCard: () => void;

    /** Whether to disable assign card button */
    isDisabledAssignCardButton?: boolean;
};

function WorkspaceCompanyCardsFeedAddedEmptyPage({handleAssignCard, isDisabledAssignCardButton}: WorkspaceCompanyCardsFeedAddedEmptyPageProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();

    return (
        <ScrollView contentContainerStyle={[styles.flexGrow1, styles.flexShrink0]}>
            <EmptyStateComponent
                SkeletonComponent={CardRowSkeleton}
                headerMediaType={CONST.EMPTY_STATE_MEDIA.ILLUSTRATION}
                headerMedia={Illustrations.CompanyCardsEmptyState}
                containerStyles={styles.mt5}
                headerStyles={[styles.emptyStateCardIllustrationContainer, styles.justifyContentStart, {backgroundColor: colors.blue700}]}
                headerContentStyles={styles.emptyStateCardIllustration}
                title={translate('workspace.moreFeatures.companyCards.emptyAddedFeedTitle')}
                subtitle={translate('workspace.moreFeatures.companyCards.emptyAddedFeedDescription')}
                buttons={[
                    {
                        buttonText: translate('workspace.companyCards.assignCard'),
                        buttonAction: handleAssignCard,
                        icon: Expensicons.Plus,
                        success: true,
                        isDisabled: isDisabledAssignCardButton,
                    },
                ]}
            />
        </ScrollView>
    );
}

WorkspaceCompanyCardsFeedAddedEmptyPage.displayName = 'WorkspaceCompanyCardsFeedAddedEmptyPage';

export default WorkspaceCompanyCardsFeedAddedEmptyPage;
