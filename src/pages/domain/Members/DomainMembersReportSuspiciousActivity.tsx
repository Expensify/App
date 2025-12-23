import React from 'react';
import Button from '@components/Button';
import FixedFooter from '@components/FixedFooter';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import RenderHTML from '@components/RenderHTML';
import ScreenWrapper from '@components/ScreenWrapper';
import Text from '@components/Text';
import useConfirmModal from '@hooks/useConfirmModal';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@navigation/types';
import DomainNotFoundPageWrapper from '@pages/domain/DomainNotFoundPageWrapper';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

type DomainMembersReportSuspiciousActivityProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.DOMAIN.MEMBER_REPORT_SUSPICIOUS_ACTIVITY>;

function DomainMembersReportSuspiciousActivity({route}: DomainMembersReportSuspiciousActivityProps) {
    const {domainAccountID, accountID} = route.params;
    const {isOffline} = useNetwork();
    const styles = useThemeStyles();

    const {translate} = useLocalize();

    const {showConfirmModal} = useConfirmModal();

    const handleReportSuspiciousActivity = () => {
        showConfirmModal({
            title: translate('lockAccountPage.reportSuspiciousActivity'),
            // prompt: translate('domain.members.reportSuspiciousActivityPrompt', 'test'),
            confirmText: translate('lockAccountPage.lockAccount'),
            shouldShowCancelButton: false,
            danger: true,
        });
    };

    return (
        <DomainNotFoundPageWrapper domainAccountID={domainAccountID}>
            <ScreenWrapper
                shouldEnableMaxHeight
                shouldUseCachedViewportHeight
                testID={DomainMembersReportSuspiciousActivity.displayName}
                enableEdgeToEdgeBottomSafeAreaPadding
            >
                <HeaderWithBackButton
                    title={translate('lockAccountPage.reportSuspiciousActivity')}
                    onBackButtonPress={() => Navigation.goBack(ROUTES.DOMAIN_MEMBER_DETAILS.getRoute(domainAccountID, accountID))}
                />
                <Text style={styles.flex1}>
                    <RenderHTML html={translate('domain.members.reportSuspiciousActivityPrompt', 'test')} />
                </Text>
                <FixedFooter>
                    <Button
                        danger
                        isDisabled={isOffline}
                        large
                        text={translate('lockAccountPage.reportSuspiciousActivity')}
                        pressOnEnter
                        onPress={handleReportSuspiciousActivity}
                    />
                </FixedFooter>
            </ScreenWrapper>
        </DomainNotFoundPageWrapper>
    );
}

DomainMembersReportSuspiciousActivity.displayName = 'DomainMembersReportSuspiciousActivity';

export default DomainMembersReportSuspiciousActivity;
