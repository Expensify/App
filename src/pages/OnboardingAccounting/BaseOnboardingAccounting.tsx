import HybridAppModule from '@expensify/react-native-hybrid-app';
import React, {useCallback, useContext, useEffect, useMemo, useState} from 'react';
import {InteractionManager, View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import Button from '@components/Button';
import CustomStatusBarAndBackgroundContext from '@components/CustomStatusBarAndBackground/CustomStatusBarAndBackgroundContext';
import FixedFooter from '@components/FixedFooter';
import FormHelpMessage from '@components/FormHelpMessage';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import Icon from '@components/Icon';
import * as Expensicons from '@components/Icon/Expensicons';
import RadioButtonWithLabel from '@components/RadioButtonWithLabel';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import {ListItem} from '@components/SelectionList/types';
import Text from '@components/Text';
import useActiveWorkspace from '@hooks/useActiveWorkspace';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import usePermissions from '@hooks/usePermissions';
import usePrevious from '@hooks/usePrevious';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import {openOldDotLink} from '@libs/actions/Link';
import {createWorkspace, generatePolicyID} from '@libs/actions/Policy/Policy';
import {completeOnboarding} from '@libs/actions/Report';
import {setOnboardingAdminsChatReportID, setOnboardingPolicyID} from '@libs/actions/Welcome';
import getPlatform from '@libs/getPlatform';
import navigateAfterOnboarding from '@libs/navigateAfterOnboarding';
import Navigation from '@libs/Navigation/Navigation';
import {isPaidGroupPolicy, isPolicyAdmin} from '@libs/PolicyUtils';
import variables from '@styles/variables';
import CONFIG from '@src/CONFIG';
import type {OnboardingAccounting} from '@src/CONST';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {BaseOnboardingAccountingProps} from './types';

type OnboardingListItem = ListItem & {
    keyForList: OnboardingAccounting;
};

function BaseOnboardingAccounting({shouldUseNativeStyles}: BaseOnboardingAccountingProps) {
    const styles = useThemeStyles();
    const theme = useTheme();
    const StyleUtils = useStyleUtils();
    const {translate} = useLocalize();
    const {setRootStatusBarEnabled} = useContext(CustomStatusBarAndBackgroundContext);

    // We need to use isSmallScreenWidth, see navigateAfterOnboarding function comment
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth
    const {onboardingIsMediumOrLargerScreenWidth, isSmallScreenWidth} = useResponsiveLayout();
    const [onboardingPurposeSelected] = useOnyx(ONYXKEYS.ONBOARDING_PURPOSE_SELECTED, {canBeMissing: true});
    const [onboardingPolicyID] = useOnyx(ONYXKEYS.ONBOARDING_POLICY_ID, {canBeMissing: true});
    const [allPolicies] = useOnyx(ONYXKEYS.COLLECTION.POLICY, {canBeMissing: false});
    const [onboardingAdminsChatReportID] = useOnyx(ONYXKEYS.ONBOARDING_ADMINS_CHAT_REPORT_ID, {canBeMissing: true});
    const [onboardingCompanySize] = useOnyx(ONYXKEYS.ONBOARDING_COMPANY_SIZE, {canBeMissing: true});
    const {canUseDefaultRooms} = usePermissions();
    const {activeWorkspaceID} = useActiveWorkspace();
    const [session] = useOnyx(ONYXKEYS.SESSION, {canBeMissing: false});

    const [userReportedIntegration, setUserReportedIntegration] = useState<OnboardingAccounting | undefined>(undefined);
    const [error, setError] = useState('');

    const paidGroupPolicy = Object.values(allPolicies ?? {}).find((policy) => isPaidGroupPolicy(policy) && isPolicyAdmin(policy, session?.email));
    const [onboarding] = useOnyx(ONYXKEYS.NVP_ONBOARDING, {canBeMissing: true});
    const {isOffline} = useNetwork();
    const isLoading = onboarding?.isLoading;
    const prevIsLoading = usePrevious(isLoading);

    // Set onboardingPolicyID and onboardingAdminsChatReportID if a workspace is created by the backend for OD signups
    useEffect(() => {
        if (!paidGroupPolicy || onboardingPolicyID) {
            return;
        }
        setOnboardingAdminsChatReportID(paidGroupPolicy.chatReportIDAdmins?.toString());
        setOnboardingPolicyID(paidGroupPolicy.id);
    }, [paidGroupPolicy, onboardingPolicyID]);

    useEffect(() => {
        if (!!isLoading || !prevIsLoading || !CONFIG.IS_HYBRID_APP) {
            return;
        }

        HybridAppModule.closeReactNativeApp({shouldSignOut: false, shouldSetNVP: true});
        setRootStatusBarEnabled(false);
    }, [isLoading, prevIsLoading, setRootStatusBarEnabled]);

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
                    case CONST.POLICY.CONNECTIONS.NAME.QBD: {
                        text = translate('workspace.accounting.qbd');
                        accountingIcon = Expensicons.QBDSquare;
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
                    case CONST.POLICY.CONNECTIONS.NAME.SAP: {
                        text = translate('workspace.accounting.sap');
                        accountingIcon = Expensicons.SapSquare;
                        break;
                    }
                    case CONST.POLICY.CONNECTIONS.NAME.ORACLE: {
                        text = translate('workspace.accounting.oracle');
                        accountingIcon = Expensicons.OracleSquare;
                        break;
                    }
                    case CONST.POLICY.CONNECTIONS.NAME.MICROSOFT_DYNAMICS: {
                        text = translate('workspace.accounting.microsoftDynamics');
                        accountingIcon = Expensicons.MicrosoftDynamicsSquare;
                        break;
                    }
                    // case CONST.POLICY.CONNECTIONS.NAME.OTHER: {
                    //     text = translate('workspace.accounting.other');
                    //     accountingIcon = Expensicons.Connect;
                    //     break;
                    // }
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
            text: translate('onboarding.accounting.none'),
            leftElement: (
                <Icon
                    src={Expensicons.CircleSlash}
                    width={variables.iconSizeNormal}
                    height={variables.iconSizeNormal}
                    fill={theme.icon}
                    additionalStyles={[StyleUtils.getAvatarBorderStyle(CONST.AVATAR_SIZE.DEFAULT, CONST.ICON_TYPE_AVATAR), styles.mr3]}
                />
            ),
            isSelected: userReportedIntegration === null,
        };
        const othersAccountingOption: OnboardingListItem = {
            keyForList: CONST.POLICY.CONNECTIONS.NAME.OTHER,
            text: translate('workspace.accounting.other'),
            leftElement: (
                <Icon
                    src={Expensicons.Connect}
                    width={variables.iconSizeNormal}
                    height={variables.iconSizeNormal}
                    fill={theme.icon}
                    additionalStyles={[StyleUtils.getAvatarBorderStyle(CONST.AVATAR_SIZE.DEFAULT, CONST.ICON_TYPE_AVATAR), styles.mr3, styles.onboardingSmallIcon]}
                />
            ),
            isSelected: userReportedIntegration === CONST.POLICY.CONNECTIONS.NAME.OTHER,
        };
        return [...policyAccountingOptions, othersAccountingOption, noneAccountingOption];
    }, [StyleUtils, styles.mr3, styles.onboardingSmallIcon, theme.icon, translate, userReportedIntegration]);

    const supportedIntegrationsInNewDot = [
        CONST.POLICY.CONNECTIONS.NAME.QBO,
        CONST.POLICY.CONNECTIONS.NAME.QBD,
        CONST.POLICY.CONNECTIONS.NAME.XERO,
        CONST.POLICY.CONNECTIONS.NAME.NETSUITE,
        CONST.POLICY.CONNECTIONS.NAME.SAGE_INTACCT,
        CONST.POLICY.CONNECTIONS.NAME.OTHER,
    ];

    const handleContinue = useCallback(() => {
        if (userReportedIntegration === undefined) {
            setError(translate('onboarding.errorSelection'));
            return;
        }

        if (!onboardingPurposeSelected || !onboardingCompanySize) {
            return;
        }

        const shouldStayInNewDot = supportedIntegrationsInNewDot.includes(userReportedIntegration as (typeof supportedIntegrationsInNewDot)[number]);
        if (!shouldStayInNewDot) {
            openOldDotLink(CONST.OLDDOT_URLS.INBOX, true);
            return;
        }

        const shouldCreateWorkspace = !onboardingPolicyID && !paidGroupPolicy;

        // We need `adminsChatReportID` for `completeOnboarding`, but at the same time, we don't want to call `createWorkspace` more than once.
        // If we have already created a workspace, we want to reuse the `onboardingAdminsChatReportID` and `onboardingPolicyID`.
        const {adminsChatReportID, policyID} = shouldCreateWorkspace
            ? createWorkspace(undefined, true, '', generatePolicyID(), CONST.ONBOARDING_CHOICES.MANAGE_TEAM, '', undefined, false, onboardingCompanySize)
            : {adminsChatReportID: onboardingAdminsChatReportID, policyID: onboardingPolicyID};

        if (shouldCreateWorkspace) {
            setOnboardingAdminsChatReportID(adminsChatReportID);
            setOnboardingPolicyID(policyID);
        }

        completeOnboarding({
            engagementChoice: onboardingPurposeSelected,
            onboardingMessage: CONST.ONBOARDING_MESSAGES[onboardingPurposeSelected],
            adminsChatReportID,
            onboardingPolicyID: policyID,
            companySize: onboardingCompanySize,
            userReportedIntegration,
        });

        if (onboardingCompanySize !== CONST.ONBOARDING_COMPANY_SIZE.MICRO && getPlatform() !== CONST.PLATFORM.DESKTOP) {
            if (CONFIG.IS_HYBRID_APP) {
                return;
            }
            openOldDotLink(CONST.OLDDOT_URLS.INBOX, true);
        }
        // Avoid creating new WS because onboardingPolicyID is cleared before unmounting
        InteractionManager.runAfterInteractions(() => {
            setOnboardingAdminsChatReportID();
            setOnboardingPolicyID();
        });

        // We need to wait the policy is created before navigating out the onboarding flow
        Navigation.setNavigationActionToMicrotaskQueue(() => {
            navigateAfterOnboarding(
                onboardingPurposeSelected,
                isSmallScreenWidth,
                canUseDefaultRooms,
                policyID,
                activeWorkspaceID,
                adminsChatReportID,
                // Onboarding tasks would show in Concierge instead of admins room for testing accounts, we should open where onboarding tasks are located
                // See https://github.com/Expensify/App/issues/57167 for more details
                (session?.email ?? '').includes('+'),
            );
        });
    }, [
        userReportedIntegration,
        translate,
        onboardingPurposeSelected,
        onboardingCompanySize,
        onboardingPolicyID,
        paidGroupPolicy,
        onboardingAdminsChatReportID,
        isSmallScreenWidth,
        canUseDefaultRooms,
        activeWorkspaceID,
        session,
    ]);

    const renderOption = useCallback(
        (item: OnboardingListItem) => (
            <RadioButtonWithLabel
                key={item.keyForList ?? ''}
                isChecked={!!item.isSelected}
                onPress={() => {
                    setUserReportedIntegration(item.keyForList);
                    setError('');
                }}
                style={[styles.flexRowReverse, styles.onboardingAccountingItem, isSmallScreenWidth && styles.flexBasis100]}
                wrapperStyle={[styles.ml0]}
                LabelComponent={() => (
                    <View style={[styles.alignItemsCenter, styles.flexRow]}>
                        {item.leftElement}
                        <Text style={styles.textStrong}>{item.text}</Text>
                    </View>
                )}
            />
        ),
        [isSmallScreenWidth, styles],
    );

    return (
        <ScreenWrapper
            testID="BaseOnboardingAccounting"
            style={[styles.defaultModalContainer, shouldUseNativeStyles && styles.pt8]}
            shouldEnableMaxHeight
        >
            <HeaderWithBackButton
                shouldShowBackButton
                progressBarPercentage={80}
                onBackButtonPress={Navigation.goBack}
            />
            <View style={[onboardingIsMediumOrLargerScreenWidth && styles.mt5, onboardingIsMediumOrLargerScreenWidth ? styles.mh8 : styles.mh5]}>
                <Text style={[styles.textHeadlineH1, styles.mb5]}>{translate('onboarding.accounting.title')}</Text>
            </View>
            <ScrollView contentContainerStyle={[styles.flex1, onboardingIsMediumOrLargerScreenWidth ? styles.mh8 : styles.mh5, styles.pt3, styles.pb8]}>
                <View style={[styles.flexRow, styles.flexWrap, styles.gap3]}>{accountingOptions.map(renderOption)}</View>
            </ScrollView>
            <FixedFooter style={[styles.pt3, styles.ph5]}>
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
                    onPress={handleContinue}
                    isLoading={isLoading}
                    isDisabled={isOffline && onboardingCompanySize !== CONST.ONBOARDING_COMPANY_SIZE.MICRO && CONFIG.IS_HYBRID_APP}
                    pressOnEnter
                />
            </FixedFooter>
        </ScreenWrapper>
    );
}

BaseOnboardingAccounting.displayName = 'BaseOnboardingAccounting';

export default BaseOnboardingAccounting;
