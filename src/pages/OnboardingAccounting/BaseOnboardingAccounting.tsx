import Button from '@components/ButtonComposed';
import CollapsibleHeaderOnKeyboard from '@components/CollapsibleHeaderOnKeyboard';
import FixedFooter from '@components/FixedFooter';
import FormHelpMessage from '@components/FormHelpMessage';
import Icon from '@components/Icon';
import OnboardingHeader from '@components/OnboardingHeader';
import {PressableWithoutFeedback} from '@components/Pressable';
import RadioButtonWithLabel from '@components/RadioButtonWithLabel';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import type {ListItem} from '@components/SelectionList/types';
import Text from '@components/Text';
import TextInput from '@components/TextInput';
import type {BaseTextInputRef} from '@components/TextInput/BaseTextInput/types';

import useCompleteOnboarding from '@hooks/useCompleteOnboarding';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import {setOnboardingAccountingEnabled, setOnboardingAdminsChatReportID, setOnboardingPolicyID, setOnboardingUserReportedIntegration} from '@libs/actions/Welcome';
import {getDefaultOnboardingFeaturesMap} from '@libs/actions/Welcome/OnboardingFeatures';
import {isMobileSafari} from '@libs/Browser';
import Navigation from '@libs/Navigation/Navigation';
import {isGroupPolicy, isPolicyAdmin} from '@libs/PolicyUtils';

import variables from '@styles/variables';

import type {OnboardingAccounting} from '@src/CONST';
import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type IconAsset from '@src/types/utils/IconAsset';

// eslint-disable-next-line no-restricted-imports
import type {ScrollView as RNScrollView} from 'react-native';

import React, {useCallback, useEffect, useRef, useState} from 'react';
import {View} from 'react-native';

import type {BaseOnboardingAccountingProps} from './types';

type Integration = {
    key: keyof typeof CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY;
    iconName: 'QBOCircle' | 'QBDSquare' | 'XeroCircle' | 'NetSuiteSquare' | 'IntacctSquare' | 'SapSquare' | 'OracleSquare' | 'MicrosoftDynamicsSquare';
    translationKey: TranslationPaths;
};

type AccountingOptionKey = Integration['key'] | 'other';

const integrations: Integration[] = [
    {
        key: 'quickbooksOnline',
        iconName: 'QBOCircle',
        translationKey: 'workspace.accounting.qbo',
    },
    {
        key: 'quickbooksDesktop',
        iconName: 'QBDSquare',
        translationKey: 'workspace.accounting.qbd',
    },
    {
        key: 'xero',
        iconName: 'XeroCircle',
        translationKey: 'workspace.accounting.xero',
    },
    {
        key: 'netsuite',
        iconName: 'NetSuiteSquare',
        translationKey: 'workspace.accounting.netsuite',
    },
    {
        key: 'intacct',
        iconName: 'IntacctSquare',
        translationKey: 'workspace.accounting.intacct',
    },
    {
        key: 'sap',
        iconName: 'SapSquare',
        translationKey: 'workspace.accounting.sap',
    },
    {
        key: 'oracle',
        iconName: 'OracleSquare',
        translationKey: 'workspace.accounting.oracle',
    },
    {
        key: 'microsoftDynamics',
        iconName: 'MicrosoftDynamicsSquare',
        translationKey: 'workspace.accounting.microsoftDynamics',
    },
];

function isIntegrationKey(integrationKey: OnboardingAccounting | undefined): integrationKey is Integration['key'] {
    return integrations.some((integration) => integration.key === integrationKey);
}

type OnboardingListItem = ListItem & {
    keyForList: AccountingOptionKey;
};

function BaseOnboardingAccounting({shouldUseNativeStyles}: BaseOnboardingAccountingProps) {
    const styles = useThemeStyles();
    const theme = useTheme();
    const StyleUtils = useStyleUtils();
    const {translate} = useLocalize();
    const expensifyIcons = useMemoizedLazyExpensifyIcons([
        'Connect',
        'QBOCircle',
        'QBDSquare',
        'XeroCircle',
        'NetSuiteSquare',
        'IntacctSquare',
        'SapSquare',
        'OracleSquare',
        'MicrosoftDynamicsSquare',
    ]);
    // We need to use isSmallScreenWidth, see navigateAfterOnboarding function comment
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth
    const {onboardingIsMediumOrLargerScreenWidth, isSmallScreenWidth, isInLandscapeMode} = useResponsiveLayout();
    const [onboardingPolicyID] = useOnyx(ONYXKEYS.ONBOARDING_POLICY_ID);
    const [allPolicies] = useOnyx(ONYXKEYS.COLLECTION.POLICY);
    const [session] = useOnyx(ONYXKEYS.SESSION);
    const [onboardingUserReportedIntegration] = useOnyx(ONYXKEYS.ONBOARDING_USER_REPORTED_INTEGRATION);
    const [onboardingFeaturesMap] = useOnyx(ONYXKEYS.ONBOARDING_INTERESTED_FEATURES_MAP);

    const isKnownIntegration = isIntegrationKey(onboardingUserReportedIntegration);
    let initialSelectedIntegration: AccountingOptionKey | undefined;
    if (isKnownIntegration) {
        initialSelectedIntegration = onboardingUserReportedIntegration;
    } else if (onboardingUserReportedIntegration) {
        initialSelectedIntegration = 'other';
    }
    const [selectedIntegration, setSelectedIntegration] = useState<AccountingOptionKey | undefined>(initialSelectedIntegration);
    const [userReportedIntegrationName, setUserReportedIntegrationName] = useState('');
    const [shouldScrollToOtherInput, setShouldScrollToOtherInput] = useState(initialSelectedIntegration === 'other');
    const [error, setError] = useState('');
    const scrollViewRef = useRef<RNScrollView>(null);
    const otherAccountingSoftwareInputRef = useRef<BaseTextInputRef | null>(null);
    const isOtherSelected = selectedIntegration === 'other';

    const groupPolicy = Object.values(allPolicies ?? {}).find((policy) => isGroupPolicy(policy) && isPolicyAdmin(policy, session?.email));
    const {isOffline} = useNetwork();
    const {completeOnboardingFlow, isLoading: isCompletingOnboarding} = useCompleteOnboarding();

    // Set onboardingPolicyID and onboardingAdminsChatReportID if a workspace is created by the backend for OD signup
    useEffect(() => {
        if (!groupPolicy || onboardingPolicyID) {
            return;
        }
        setOnboardingAdminsChatReportID(groupPolicy.chatReportIDAdmins?.toString());
        setOnboardingPolicyID(groupPolicy.id);
    }, [groupPolicy, onboardingPolicyID]);

    const createAccountingOption = (integration: Integration): OnboardingListItem => {
        const icon = expensifyIcons[integration.iconName] as IconAsset | undefined;
        return {
            keyForList: integration.key,
            text: translate(integration.translationKey),
            leftElement: (
                <Icon
                    src={icon}
                    width={variables.iconSizeExtraLarge}
                    height={variables.iconSizeExtraLarge}
                    additionalStyles={[StyleUtils.getAvatarBorderStyle(CONST.AVATAR_SIZE.DEFAULT, CONST.ICON_TYPE_AVATAR), styles.mr3]}
                />
            ),
            isSelected: selectedIntegration === integration.key,
        };
    };

    const othersAccountingOption: OnboardingListItem = {
        keyForList: 'other',
        text: translate('workspace.accounting.other'),
        leftElement: (
            <Icon
                src={expensifyIcons.Connect}
                width={variables.iconSizeNormal}
                height={variables.iconSizeNormal}
                fill={theme.icon}
                additionalStyles={[StyleUtils.getAvatarBorderStyle(CONST.AVATAR_SIZE.DEFAULT, CONST.ICON_TYPE_AVATAR), styles.mr3, styles.onboardingSmallIcon]}
            />
        ),
        isSelected: isOtherSelected,
    };

    const accountingOptions: OnboardingListItem[] = [...integrations.map(createAccountingOption), othersAccountingOption];

    const submitAccounting = async () => {
        if (!selectedIntegration) {
            setError(translate('onboarding.errorSelection'));
            return;
        }

        const integrationValue: OnboardingAccounting = selectedIntegration;
        const trimmedIntegrationName = userReportedIntegrationName.trim();
        const integrationName = integrationValue === 'other' && trimmedIntegrationName ? trimmedIntegrationName : undefined;
        setOnboardingAccountingEnabled(true);
        setOnboardingUserReportedIntegration(integrationValue);
        await completeOnboardingFlow({
            featuresMap: onboardingFeaturesMap ?? getDefaultOnboardingFeaturesMap(),
            userReportedIntegration: integrationValue,
            userReportedIntegrationName: integrationName,
        });
    };

    const handleIntegrationSelect = (integrationKey: OnboardingListItem['keyForList']) => {
        if (integrationKey === 'other' && isOtherSelected) {
            otherAccountingSoftwareInputRef.current?.focus();
            setError('');
            return;
        }

        setSelectedIntegration(integrationKey);
        setShouldScrollToOtherInput(integrationKey === 'other');
        if (integrationKey !== 'other') {
            setUserReportedIntegrationName('');
        }
        setError('');
    };

    const handleContentSizeChange = useCallback(() => {
        if (!shouldScrollToOtherInput) {
            return;
        }

        scrollViewRef.current?.scrollToEnd({animated: false});
        setShouldScrollToOtherInput(false);
    }, [shouldScrollToOtherInput]);

    function renderOption(item: OnboardingListItem) {
        return (
            <PressableWithoutFeedback
                key={item.keyForList}
                onPress={() => handleIntegrationSelect(item.keyForList)}
                accessibilityLabel={item.text}
                sentryLabel={CONST.SENTRY_LABEL.ONBOARDING.ACCOUNTING_SELECT_INTEGRATION}
                accessible={false}
                hoverStyle={styles.hoveredComponentBG}
                style={[styles.onboardingAccountingItem, isSmallScreenWidth && styles.flexBasis100]}
            >
                <RadioButtonWithLabel
                    isChecked={!!item.isSelected}
                    onPress={() => handleIntegrationSelect(item.keyForList)}
                    accessibilityLabel={item.text}
                    style={[styles.flexRowReverse]}
                    wrapperStyle={[styles.ml0]}
                    labelElement={
                        <View style={[styles.alignItemsCenter, styles.flexRow]}>
                            {item.leftElement}
                            <Text style={styles.textStrong}>{item.text}</Text>
                        </View>
                    }
                    shouldBlendOpacity
                />
            </PressableWithoutFeedback>
        );
    }

    const continueButton = (
        <>
            {!!error && (
                <FormHelpMessage
                    style={[styles.ph1, styles.mb2]}
                    isError
                    message={error}
                />
            )}

            <Button
                variant={CONST.BUTTON_VARIANT.SUCCESS}
                size={CONST.BUTTON_SIZE.LARGE}
                onPress={submitAccounting}
                isDisabled={isOffline}
                isLoading={isCompletingOnboarding}
                sentryLabel={CONST.SENTRY_LABEL.ONBOARDING.CONTINUE}
            >
                <Button.KeyboardShortcut />
                <Button.Text>{translate('common.continue')}</Button.Text>
            </Button>
        </>
    );

    return (
        <ScreenWrapper
            testID="BaseOnboardingAccounting"
            style={[styles.defaultModalContainer, shouldUseNativeStyles && styles.pt8]}
            shouldEnableMaxHeight={!isMobileSafari()}
            shouldAvoidScrollOnVirtualViewport={!isMobileSafari()}
        >
            <CollapsibleHeaderOnKeyboard>
                <OnboardingHeader onBackButtonPress={() => Navigation.goBack(ROUTES.ONBOARDING_INTERESTED_FEATURES.getRoute())} />
                <View style={[onboardingIsMediumOrLargerScreenWidth && styles.mt5, onboardingIsMediumOrLargerScreenWidth ? styles.mh8 : styles.mh5]}>
                    <Text
                        style={[styles.textHeadlineH1, styles.mb5]}
                        accessibilityRole={CONST.ROLE.HEADER}
                    >
                        {translate('onboarding.accounting.title')}
                    </Text>
                </View>
            </CollapsibleHeaderOnKeyboard>
            <ScrollView
                ref={scrollViewRef}
                style={[onboardingIsMediumOrLargerScreenWidth ? styles.mh8 : styles.mh5]}
                contentContainerStyle={[styles.pt3, styles.pb5]}
                onContentSizeChange={handleContentSizeChange}
                keyboardShouldPersistTaps="handled"
            >
                <View style={[styles.flexRow, styles.flexWrap, styles.gap3, styles.mb3]}>
                    {accountingOptions.map(renderOption)}
                    {/* Keep Other from expanding across the empty second column on wide layouts. */}
                    {!isSmallScreenWidth && (
                        <View
                            testID="onboarding-accounting-wide-layout-spacer"
                            style={[styles.onboardingAccountingItem, styles.bgTransparent, styles.p0]}
                        />
                    )}
                </View>
                {isOtherSelected && (
                    <TextInput
                        ref={otherAccountingSoftwareInputRef}
                        accessibilityLabel={translate('onboarding.accounting.otherAccountingSoftware')}
                        label={translate('onboarding.accounting.otherAccountingSoftware')}
                        value={userReportedIntegrationName}
                        onChangeText={setUserReportedIntegrationName}
                        autoFocus
                    />
                )}

                {isInLandscapeMode && <View style={[styles.pt8]}>{continueButton}</View>}
            </ScrollView>
            {!isInLandscapeMode && <FixedFooter style={[styles.pt3, styles.ph5]}>{continueButton}</FixedFooter>}
        </ScreenWrapper>
    );
}

export default BaseOnboardingAccounting;
