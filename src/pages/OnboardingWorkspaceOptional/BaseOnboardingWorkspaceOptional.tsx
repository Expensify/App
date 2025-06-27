import React, {useCallback, useEffect} from 'react';
import {View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import Button from '@components/Button';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import Icon from '@components/Icon';
import * as Illustrations from '@components/Icon/Illustrations';
import RenderHTML from '@components/RenderHTML';
import ScreenWrapper from '@components/ScreenWrapper';
import Text from '@components/Text';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useLocalize from '@hooks/useLocalize';
import useOnboardingMessages from '@hooks/useOnboardingMessages';
import usePermissions from '@hooks/usePermissions';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import navigateAfterOnboarding from '@libs/navigateAfterOnboarding';
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
    // When we merge public email with work email, we now want to navigate to the
    // concierge chat report of the new work email and not the last accessed report.
    const mergedAccountConciergeReportID = !onboardingValues?.shouldRedirectToClassicAfterMerge && onboardingValues?.shouldValidate ? conciergeChatReportID : undefined;
    // We need to use isSmallScreenWidth, see navigateAfterOnboarding function comment
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth
    const {onboardingIsMediumOrLargerScreenWidth, isSmallScreenWidth} = useResponsiveLayout();
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    const {isBetaEnabled} = usePermissions();
    const ICON_SIZE = 48;

    const processedHelperText = `<comment><muted-text-label>${translate('onboarding.workspace.price')}</muted-text-label></comment>`;

    useEffect(() => {
        setOnboardingErrorMessage('');
    }, []);

    const section: Item[] = [
        {
            icon: Illustrations.MoneyReceipts,
            titleTranslationKey: 'onboarding.workspace.explanationModal.descriptionOne',
        },
        {
            icon: Illustrations.Tag,
            titleTranslationKey: 'onboarding.workspace.explanationModal.descriptionTwo',
        },
        {
            icon: Illustrations.ReportReceipt,
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
        });

        setOnboardingAdminsChatReportID();
        setOnboardingPolicyID();

        navigateAfterOnboarding(isSmallScreenWidth, isBetaEnabled(CONST.BETAS.DEFAULT_ROOMS), onboardingPolicyID, mergedAccountConciergeReportID);
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
            testID={BaseOnboardingWorkspaceOptional.displayName}
            style={[styles.defaultModalContainer, shouldUseNativeStyles && styles.pt8]}
        >
            <HeaderWithBackButton progressBarPercentage={100} />
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
                <View>
                    <Button
                        success
                        large
                        text={translate('onboarding.workspace.createWorkspace')}
                        onPress={() => {
                            setOnboardingErrorMessage('');
                            Navigation.navigate(ROUTES.ONBOARDING_WORKSPACE_CONFIRMATION.getRoute());
                        }}
                    />
                </View>
            </View>
        </ScreenWrapper>
    );
}

BaseOnboardingWorkspaceOptional.displayName = 'BaseOnboardingWorkspaceOptional';

export default BaseOnboardingWorkspaceOptional;
