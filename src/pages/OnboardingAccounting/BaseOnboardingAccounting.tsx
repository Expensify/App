import React, {useEffect, useMemo, useState} from 'react';
import {InteractionManager} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import Button from '@components/Button';
import FormHelpMessage from '@components/FormHelpMessage';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import Icon from '@components/Icon';
import * as Expensicons from '@components/Icon/Expensicons';
import ScreenWrapper from '@components/ScreenWrapper';
import SelectionList from '@components/SelectionList';
import RadioListItem from '@components/SelectionList/RadioListItem';
import type {ListItem} from '@components/SelectionList/types';
import Text from '@components/Text';
import useActiveWorkspace from '@hooks/useActiveWorkspace';
import useLocalize from '@hooks/useLocalize';
import usePermissions from '@hooks/usePermissions';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import navigateAfterOnboarding from '@libs/navigateAfterOnboarding';
import Navigation from '@libs/Navigation/Navigation';
import * as PolicyUtils from '@libs/PolicyUtils';
import variables from '@styles/variables';
import * as Policy from '@userActions/Policy/Policy';
import * as Report from '@userActions/Report';
import * as Welcome from '@userActions/Welcome';
import CONST from '@src/CONST';
import type {OnboardingAccounting} from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {} from '@src/types/onyx/Bank';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';
import type {BaseOnboardingAccountingProps} from './types';

type OnboardingListItem = ListItem & {
    keyForList: OnboardingAccounting;
};

function BaseOnboardingAccounting({shouldUseNativeStyles, route}: BaseOnboardingAccountingProps) {
    const styles = useThemeStyles();
    const theme = useTheme();
    const StyleUtils = useStyleUtils();
    const {translate} = useLocalize();

    // We need to use isSmallScreenWidth, see navigateAfterOnboarding function comment
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth
    const {onboardingIsMediumOrLargerScreenWidth, isSmallScreenWidth, shouldUseNarrowLayout} = useResponsiveLayout();
    const [onboardingValues] = useOnyx(ONYXKEYS.NVP_ONBOARDING);
    const [onboardingPurposeSelected] = useOnyx(ONYXKEYS.ONBOARDING_PURPOSE_SELECTED);
    const [onboardingPolicyID] = useOnyx(ONYXKEYS.ONBOARDING_POLICY_ID);
    const [allPolicies, allPoliciesResult] = useOnyx(ONYXKEYS.COLLECTION.POLICY);
    const [onboardingAdminsChatReportID] = useOnyx(ONYXKEYS.ONBOARDING_ADMINS_CHAT_REPORT_ID);
    const [onboardingCompanySize] = useOnyx(ONYXKEYS.ONBOARDING_COMPANY_SIZE);
    const {canUseDefaultRooms} = usePermissions();
    const {activeWorkspaceID} = useActiveWorkspace();

    const [userReportedIntegration, setUserReportedIntegration] = useState<OnboardingAccounting | undefined>(undefined);
    const [error, setError] = useState('');
    const isVsb = onboardingValues && 'signupQualifier' in onboardingValues && onboardingValues.signupQualifier === CONST.ONBOARDING_SIGNUP_QUALIFIERS.VSB;

    // If the signupQualifier is VSB, the company size step is skip.
    // So we need to create the new workspace in the accounting step
    const paidGroupPolicy = Object.values(allPolicies ?? {}).find(PolicyUtils.isPaidGroupPolicy);
    useEffect(() => {
        // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
        if (!isVsb || paidGroupPolicy || isLoadingOnyxValue(allPoliciesResult)) {
            return;
        }

        const {adminsChatReportID, policyID} = Policy.createWorkspace(undefined, true, '', Policy.generatePolicyID(), CONST.ONBOARDING_CHOICES.MANAGE_TEAM);
        Welcome.setOnboardingAdminsChatReportID(adminsChatReportID);
        Welcome.setOnboardingPolicyID(policyID);
    }, [isVsb, paidGroupPolicy, allPolicies, allPoliciesResult]);

    // Set onboardingPolicyID and onboardingAdminsChatReportID if a workspace is created by the backend for OD signups
    useEffect(() => {
        if (!paidGroupPolicy || onboardingPolicyID) {
            return;
        }
        Welcome.setOnboardingAdminsChatReportID(paidGroupPolicy.chatReportIDAdmins?.toString());
        Welcome.setOnboardingPolicyID(paidGroupPolicy.id);
    }, [paidGroupPolicy, onboardingPolicyID]);

    const accountingOptions: OnboardingListItem[] = useMemo(() => {
        const policyAccountingOptions = Object.values(CONST.POLICY.CONNECTIONS.NAME)
            .map((connectionName): OnboardingListItem | undefined => {
                let text;
                let accountingIcon;
                switch (connectionName) {
                    case CONST.POLICY.CONNECTIONS.NAME.QBO: {
                        text = translate('workspace.accounting.qbo');
                        accountingIcon = Expensicons.QBOCircle;
                        break;
                    }
                    case CONST.POLICY.CONNECTIONS.NAME.XERO: {
                        text = translate('workspace.accounting.xero');
                        accountingIcon = Expensicons.XeroCircle;
                        break;
                    }
                    case CONST.POLICY.CONNECTIONS.NAME.NETSUITE: {
                        text = translate('workspace.accounting.netsuite');
                        accountingIcon = Expensicons.NetSuiteSquare;
                        break;
                    }
                    case CONST.POLICY.CONNECTIONS.NAME.SAGE_INTACCT: {
                        text = translate('workspace.accounting.intacct');
                        accountingIcon = Expensicons.IntacctSquare;
                        break;
                    }
                    default: {
                        return;
                    }
                }
                return {
                    keyForList: connectionName,
                    text,
                    leftElement: (
                        <Icon
                            src={accountingIcon}
                            width={variables.iconSizeExtraLarge}
                            height={variables.iconSizeExtraLarge}
                            additionalStyles={[StyleUtils.getAvatarBorderStyle(CONST.AVATAR_SIZE.DEFAULT, CONST.ICON_TYPE_AVATAR), styles.mr3]}
                        />
                    ),
                    isSelected: userReportedIntegration === connectionName,
                };
            })
            .filter((item): item is OnboardingListItem => !!item);
        const noneAccountingOption: OnboardingListItem = {
            keyForList: null,
            text: translate('onboarding.accounting.noneOfAbove'),
            leftElement: (
                <Icon
                    src={Expensicons.Clear}
                    width={variables.iconSizeNormal}
                    height={variables.iconSizeNormal}
                    fill={theme.success}
                    additionalStyles={[StyleUtils.getAvatarBorderStyle(CONST.AVATAR_SIZE.DEFAULT, CONST.ICON_TYPE_AVATAR), styles.mr3, styles.onboardingSmallIcon]}
                />
            ),
            isSelected: userReportedIntegration === null,
        };
        return [...policyAccountingOptions, noneAccountingOption];
    }, [StyleUtils, styles.mr3, styles.onboardingSmallIcon, theme.success, translate, userReportedIntegration]);

    const footerContent = (
        <>
            {!!error && (
                <FormHelpMessage
                    style={[styles.ph1, styles.mb2]}
                    isError
                    message={error}
                />
            )}
            <Button
                success
                large
                text={translate('common.continue')}
                onPress={() => {
                    if (userReportedIntegration === undefined) {
                        setError(translate('onboarding.errorSelection'));
                        return;
                    }

                    if (!onboardingPurposeSelected) {
                        return;
                    }

                    Report.completeOnboarding(
                        onboardingPurposeSelected,
                        CONST.ONBOARDING_MESSAGES[onboardingPurposeSelected],
                        undefined,
                        undefined,
                        onboardingAdminsChatReportID ?? undefined,
                        onboardingPolicyID,
                        undefined,
                        onboardingCompanySize,
                        userReportedIntegration,
                    );
                    // Avoid creating new WS because onboardingPolicyID is cleared before unmounting
                    InteractionManager.runAfterInteractions(() => {
                        Welcome.setOnboardingAdminsChatReportID();
                        Welcome.setOnboardingPolicyID();
                    });
                    navigateAfterOnboarding(isSmallScreenWidth, shouldUseNarrowLayout, canUseDefaultRooms, onboardingPolicyID, activeWorkspaceID, route.params?.backTo);
                }}
                pressOnEnter
            />
        </>
    );

    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom={false}
            testID="BaseOnboardingAccounting"
            style={[styles.defaultModalContainer, shouldUseNativeStyles && styles.pt8]}
        >
            <HeaderWithBackButton
                shouldShowBackButton
                progressBarPercentage={80}
                onBackButtonPress={Navigation.goBack}
            />
            <Text style={[styles.textHeadlineH1, styles.mb5, onboardingIsMediumOrLargerScreenWidth && styles.mt5, onboardingIsMediumOrLargerScreenWidth ? styles.mh8 : styles.mh5]}>
                {translate('onboarding.accounting.title')}
            </Text>
            <SelectionList
                sections={[{data: accountingOptions}]}
                onSelectRow={(item) => {
                    setUserReportedIntegration(item.keyForList);
                    setError('');
                }}
                shouldUpdateFocusedIndex
                ListItem={RadioListItem}
                footerContent={footerContent}
                shouldShowTooltips={false}
                listItemWrapperStyle={onboardingIsMediumOrLargerScreenWidth ? [styles.pl8, styles.pr8] : []}
            />
        </ScreenWrapper>
    );
}

BaseOnboardingAccounting.displayName = 'BaseOnboardingAccounting';

export default BaseOnboardingAccounting;
