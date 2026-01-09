import React, {useCallback, useEffect} from 'react';
import {View} from 'react-native';
import Button from '@components/Button';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import Icon from '@components/Icon';
import RenderHTML from '@components/RenderHTML';
import ScreenWrapper from '@components/ScreenWrapper';
import Text from '@components/Text';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import {useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnboardingMessages from '@hooks/useOnboardingMessages';
import useOnyx from '@hooks/useOnyx';
import usePermissions from '@hooks/usePermissions';
import usePreferredPolicy from '@hooks/usePreferredPolicy';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import {navigateAfterOnboardingWithMicrotaskQueue} from '@libs/navigateAfterOnboarding';
import Navigation from '@libs/Navigation/Navigation';
import {completeOnboarding as completeOnboardingReport} from '@userActions/Report';
import {setOnboardingAdminsChatReportID, setOnboardingErrorMessage, setOnboardingPolicyID} from '@userActions/Welcome';
import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type IconAsset from '@src/types/utils/IconAsset';
import type {BaseOnboardingWorkspaceOptionalProps} from './types';

type Item = {
    icon: IconAsset;
    titleTranslationKey: TranslationPaths;
};

function BaseOnboardingWorkspaceOptional({shouldUseNativeStyles}: BaseOnboardingWorkspaceOptionalProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const [onboardingValues] = useOnyx(ONYXKEYS.NVP_ONBOARDING, {canBeMissing: true});
    const [onboardingPurposeSelected] = useOnyx(ONYXKEYS.ONBOARDING_PURPOSE_SELECTED, {canBeMissing: true});
    const [onboardingPolicyID] = useOnyx(ONYXKEYS.ONBOARDING_POLICY_ID, {canBeMissing: true});
    const [onboardingAdminsChatReportID] = useOnyx(ONYXKEYS.ONBOARDING_ADMINS_CHAT_REPORT_ID, {canBeMissing: true});
    const [conciergeChatReportID] = useOnyx(ONYXKEYS.CONCIERGE_REPORT_ID, {canBeMissing: true});
    const {onboardingMessages} = useOnboardingMessages();
    const {isRestrictedPolicyCreation} = usePreferredPolicy();
    // When we merge public email with work email, we now want to navigate to the
    // concierge chat report of the new work email and not the last accessed report.
    const mergedAccountConciergeReportID = !onboardingValues?.shouldRedirectToClassicAfterMerge && onboardingValues?.shouldValidate ? conciergeChatReportID : undefined;
    // We need to use isSmallScreenWidth, see navigateAfterOnboarding function comment
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth
    const {onboardingIsMediumOrLargerScreenWidth, isSmallScreenWidth} = useResponsiveLayout();
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    const {isBetaEnabled} = usePermissions();
    const ICON_SIZE = 48;
    const illustrations = useMemoizedLazyIllustrations(['MoneyReceipts', 'Tag', 'ReportReceipt']);

    const processedHelperText = `<comment><muted-text-label>${translate('onboarding.workspace.price')}</muted-text-label></comment>`;

    useEffect(() => {
        setOnboardingErrorMessage(null);
    }, []);

    const section: Item[] = [
        {
            icon: illustrations.MoneyReceipts,
            titleTranslationKey: 'onboarding.workspace.explanationModal.descriptionOne',
        },
        {
            icon: illustrations.Tag,
            titleTranslationKey: 'onboarding.workspace.explanationModal.descriptionTwo',
        },
        {
            icon: illustrations.ReportReceipt,
            titleTranslationKey: 'onboarding.workspace.explanationModal.descriptionThree',
        },
    ];

    const completeOnboarding = useCallback(() => {
        if (!onboardingPurposeSelected) {
            return;
        }

        completeOnboardingReport({
            engagementChoice: onboardingPurposeSelected,
            onboardingMessage: onboardingMessages[onboardingPurposeSelected],
            firstName: currentUserPersonalDetails.firstName,
            lastName: currentUserPersonalDetails.lastName,
            adminsChatReportID: onboardingAdminsChatReportID,
            onboardingPolicyID,
            shouldSkipTestDriveModal: !!onboardingPolicyID && !onboardingAdminsChatReportID,
        });

        setOnboardingAdminsChatReportID();
        setOnboardingPolicyID();

        navigateAfterOnboardingWithMicrotaskQueue(isSmallScreenWidth, isBetaEnabled(CONST.BETAS.DEFAULT_ROOMS), onboardingPolicyID, mergedAccountConciergeReportID);
    }, [
        onboardingPurposeSelected,
        currentUserPersonalDetails.firstName,
        currentUserPersonalDetails.lastName,
        onboardingAdminsChatReportID,
        onboardingMessages,
        onboardingPolicyID,
        isSmallScreenWidth,
        isBetaEnabled,
        mergedAccountConciergeReportID,
    ]);

    return (
        <ScreenWrapper
            shouldEnableMaxHeight
            testID="BaseOnboardingWorkspaceOptional"
            style={[styles.defaultModalContainer, shouldUseNativeStyles && styles.pt8]}
        >
            <HeaderWithBackButton
                progressBarPercentage={100}
                shouldDisplayHelpButton={false}
            />
            <View style={[styles.flexGrow1, onboardingIsMediumOrLargerScreenWidth && styles.mt5, onboardingIsMediumOrLargerScreenWidth ? styles.mh8 : styles.mh5]}>
                <View style={[onboardingIsMediumOrLargerScreenWidth ? styles.flexRow : styles.flexColumn, styles.mb3]}>
                    <Text style={styles.textHeadlineH1}>{translate('onboarding.workspace.title')}</Text>
                </View>
                <View style={styles.mb2}>
                    <Text style={[styles.textNormal, styles.colorMuted]}>{translate('onboarding.workspace.subtitle')}</Text>
                </View>
                <View>
                    {section.map((item) => {
                        return (
                            <View
                                key={item.titleTranslationKey}
                                style={[styles.mt2, styles.mb3, styles.flexRow]}
                            >
                                <View style={[styles.flexRow, styles.alignItemsCenter, styles.flex1]}>
                                    <Icon
                                        src={item.icon}
                                        height={ICON_SIZE}
                                        width={ICON_SIZE}
                                        additionalStyles={[styles.mr3]}
                                    />
                                    <View style={[styles.flexColumn, styles.flex1]}>
                                        <Text style={[styles.textStrong, styles.lh20]}>{translate(item.titleTranslationKey)}</Text>
                                    </View>
                                </View>
                            </View>
                        );
                    })}
                </View>
            </View>
            <View style={[onboardingIsMediumOrLargerScreenWidth ? styles.mh8 : styles.mh5, styles.pb5]}>
                <View style={[styles.flexRow, styles.renderHTML, styles.pb5]}>
                    <RenderHTML html={processedHelperText} />
                </View>
                <View style={styles.mb2}>
                    <Button
                        large
                        text={translate('common.skip')}
                        onPress={() => completeOnboarding()}
                    />
                </View>
                {!isRestrictedPolicyCreation && (
                    <View>
                        <Button
                            success
                            large
                            text={translate('onboarding.workspace.createWorkspace')}
                            onPress={() => {
                                setOnboardingErrorMessage(null);
                                Navigation.navigate(ROUTES.ONBOARDING_WORKSPACE_CONFIRMATION.getRoute());
                            }}
                        />
                    </View>
                )}
            </View>
        </ScreenWrapper>
    );
}

export default BaseOnboardingWorkspaceOptional;
