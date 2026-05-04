import React, {useEffect} from 'react';
import GenericEmptyStateComponent from '@components/EmptyStateComponent/GenericEmptyStateComponent';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import useDocumentTitle from '@hooks/useDocumentTitle';
import {useMemoizedLazyExpensifyIcons, useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import usePermissions from '@hooks/usePermissions';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import NotFoundPage from '@pages/ErrorPage/NotFoundPage';
import {openAgentsPage} from '@userActions/Agent';
import CONST from '@src/CONST';

function AgentsPage() {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const illustrations = useMemoizedLazyIllustrations(['TvScreenRobot', 'AiBot']);
    const icons = useMemoizedLazyExpensifyIcons(['Plus']);
    const {isBetaEnabled} = usePermissions();
    const isCustomAgentEnabled = isBetaEnabled(CONST.BETAS.CUSTOM_AGENT);
    useDocumentTitle(translate('agentsPage.title'));

    useEffect(() => {
        if (!isCustomAgentEnabled) {
            return;
        }
        openAgentsPage();
    }, [isCustomAgentEnabled]);

    if (!isCustomAgentEnabled) {
        return <NotFoundPage />;
    }

    return (
        <ScreenWrapper
            enableEdgeToEdgeBottomSafeAreaPadding
            style={[styles.defaultModalContainer]}
            testID={AgentsPage.displayName}
            shouldShowOfflineIndicatorInWideScreen
            offlineIndicatorStyle={styles.mtAuto}
        >
            <HeaderWithBackButton
                icon={illustrations.AiBot}
                onBackButtonPress={() => Navigation.goBack()}
                shouldShowBackButton={shouldUseNarrowLayout}
                shouldUseHeadlineHeader
                title={translate('agentsPage.title')}
            />
            <ScrollView contentContainerStyle={[styles.flexGrow1, styles.flexShrink0]}>
                <GenericEmptyStateComponent
                    headerMedia={illustrations.TvScreenRobot}
                    title={translate('agentsPage.emptyAgents.title')}
                    subtitle={translate('agentsPage.emptyAgents.subtitle')}
                    subtitleStyles={styles.agentsPageEmptyStateSubtitle}
                    headerStyles={styles.emptyStateCardIllustrationContainer}
                    headerContentStyles={styles.agentsPageEmptyStateIllustration}
                    buttons={[
                        {
                            success: true,
                            buttonAction: () => {},
                            icon: icons.Plus,
                            buttonText: translate('agentsPage.newAgent'),
                        },
                    ]}
                />
            </ScrollView>
        </ScreenWrapper>
    );
}

AgentsPage.displayName = 'AgentsPage';

export default AgentsPage;
