import Button from '@components/Button';
import ButtonDisabledWhenOffline from '@components/Button/composed/ButtonDisabledWhenOffline';
import CollapsibleHeaderOnKeyboard from '@components/CollapsibleHeaderOnKeyboard';
import FixedFooter from '@components/FixedFooter';
import FormHelpMessage from '@components/FormHelpMessage';
import Icon from '@components/Icon';
import OnboardingHeader from '@components/OnboardingHeader';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import CompactSearchBar from '@components/SearchBar/CompactSearchBar';
import Text from '@components/Text';

import useCompleteOnboarding from '@hooks/useCompleteOnboarding';
import useLayoutSpacing from '@hooks/useLayoutSpacing';
import {useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePermissions from '@hooks/usePermissions';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useShouldFooterBeInsideList from '@hooks/useShouldFooterBeInsideList';
import useThemeStyles from '@hooks/useThemeStyles';

import {isAccountingConnectionAvailable} from '@libs/AccountingUtils';
import {
    setOnboardingAccountingDraft,
    setOnboardingAccountingEnabled,
    setOnboardingAdminsChatReportID,
    setOnboardingPolicyID,
    setOnboardingUserReportedIntegration,
} from '@libs/actions/Welcome';
import {getDefaultOnboardingFeaturesMap} from '@libs/actions/Welcome/OnboardingFeatures';
import {isMobileSafari} from '@libs/Browser';
import Navigation from '@libs/Navigation/Navigation';
import {isGroupPolicy, isPolicyAdmin} from '@libs/PolicyUtils';

import variables from '@styles/variables';

import type {OnboardingAccounting, OnboardingAccountingOption} from '@src/CONST';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';

import React, {useEffect, useState} from 'react';
import {View} from 'react-native';

import type {AccountingOption} from './accountingOptions';
import type {BaseOnboardingAccountingProps} from './types';

import AccountingOptionRow from './AccountingOptionRow';
import accountingOptions, {isOnboardingAccountingOption} from './accountingOptions';

function BaseOnboardingAccounting({shouldUseNativeStyles}: BaseOnboardingAccountingProps) {
    const styles = useThemeStyles();
    const {cardPaddingHorizontal} = useLayoutSpacing();
    const {translate} = useLocalize();
    const illustrations = useMemoizedLazyIllustrations(['Computer']);
    const {onboardingIsMediumOrLargerScreenWidth} = useResponsiveLayout();
    const shouldFooterBeInsideScrollView = useShouldFooterBeInsideList();
    const [onboardingPolicyID] = useOnyx(ONYXKEYS.ONBOARDING_POLICY_ID);
    const [allPolicies] = useOnyx(ONYXKEYS.COLLECTION.POLICY);
    const [session] = useOnyx(ONYXKEYS.SESSION);
    const [onboardingUserReportedIntegration] = useOnyx(ONYXKEYS.ONBOARDING_USER_REPORTED_INTEGRATION);
    const [draft] = useOnyx(ONYXKEYS.ONBOARDING_ACCOUNTING_DRAFT);
    const [onboardingFeaturesMap] = useOnyx(ONYXKEYS.ONBOARDING_INTERESTED_FEATURES_MAP);
    const [searchQuery, setSearchQuery] = useState('');
    const [error, setError] = useState('');
    const {isBetaEnabled} = usePermissions();
    const onboardingPolicy = allPolicies?.[`${ONYXKEYS.COLLECTION.POLICY}${onboardingPolicyID}`];
    const canUseBusinessCentral = isBetaEnabled(CONST.BETAS.BUSINESS_CENTRAL) || !!onboardingPolicy?.connections?.businessCentral;
    const canUseDigits = isBetaEnabled(CONST.BETAS.DIGITS) || !!onboardingPolicy?.connections?.digits;
    const availableOptions = accountingOptions.filter((option) => !option.connectionName || isAccountingConnectionAvailable(option.connectionName, canUseBusinessCentral, canUseDigits));

    const savedIntegration = draft ? draft.integration : onboardingUserReportedIntegration;
    const selectedAnswer: {integration: OnboardingAccountingOption; name?: string} | undefined = savedIntegration
        ? {integration: isOnboardingAccountingOption(savedIntegration) ? savedIntegration : 'other', name: draft?.name}
        : undefined;
    const selectedOption = availableOptions.find((option) =>
        option.integration === 'other' ? selectedAnswer?.integration === 'other' && selectedAnswer.name === option.name : selectedAnswer?.integration === option.integration,
    );
    // Saved answers may refer to a legacy product or a connection whose beta is no longer enabled.
    const customOption: AccountingOption | undefined =
        selectedAnswer?.integration && !selectedOption && (selectedAnswer.integration !== 'other' || selectedAnswer.name)
            ? {
                  name: selectedAnswer.name ?? CONST.ONBOARDING_ACCOUNTING_MAPPING[selectedAnswer.integration],
                  integration: selectedAnswer.integration,
                  iconName: 'Building',
              }
            : undefined;
    const options = customOption ? [...availableOptions, customOption] : availableOptions;
    const trimmedQuery = searchQuery.trim();
    const normalizedQuery = trimmedQuery.toLocaleLowerCase();
    const filteredOptions = options.filter((option) => `${option.name} ${option.aliases ?? ''}`.toLocaleLowerCase().includes(normalizedQuery));

    const groupPolicy = Object.values(allPolicies ?? {}).find((policy) => isGroupPolicy(policy) && isPolicyAdmin(policy, session?.email));
    const {completeOnboardingFlow, isLoading: isCompletingOnboarding} = useCompleteOnboarding();

    // Set onboardingPolicyID and onboardingAdminsChatReportID if a workspace is created by the backend for OD signup.
    useEffect(() => {
        if (!groupPolicy || onboardingPolicyID) {
            return;
        }
        setOnboardingAdminsChatReportID(groupPolicy.chatReportIDAdmins?.toString());
        setOnboardingPolicyID(groupPolicy.id);
    }, [groupPolicy, onboardingPolicyID]);

    const unsupportedTitle = translate('onboarding.accounting.unsupportedTitle', trimmedQuery);
    const unsupportedSubtitle = translate('onboarding.accounting.unsupportedSubtitle');
    const confirmSoftwareLabel = translate('onboarding.accounting.confirmSoftware', trimmedQuery);

    const submitAccounting = async () => {
        if (!selectedAnswer) {
            setError(translate('onboarding.errorSelection'));
            return;
        }

        const integrationValue: OnboardingAccounting = selectedAnswer.integration;
        const integrationName = integrationValue === 'other' ? selectedAnswer.name?.trim() || undefined : undefined;
        setOnboardingAccountingEnabled(true);
        setOnboardingUserReportedIntegration(integrationValue);
        await completeOnboardingFlow({
            featuresMap: onboardingFeaturesMap ?? getDefaultOnboardingFeaturesMap(),
            userReportedIntegration: integrationValue,
            userReportedIntegrationName: integrationName,
        });
    };

    const selectIntegration = (option: AccountingOption) => {
        setOnboardingAccountingDraft({integration: option.integration, name: option.integration === 'other' ? option.name : undefined});
        setError('');
    };

    const continueButton = (
        <>
            {!!error && (
                <FormHelpMessage
                    style={[styles.ph1, styles.mb2]}
                    isError
                    message={error}
                />
            )}
            <ButtonDisabledWhenOffline
                variant={CONST.BUTTON_VARIANT.SUCCESS}
                size={CONST.BUTTON_SIZE.LARGE}
                onPress={submitAccounting}
                isLoading={isCompletingOnboarding}
                sentryLabel={CONST.SENTRY_LABEL.ONBOARDING.CONTINUE}
            >
                <Button.KeyboardShortcut />
                <Button.Text>{translate('common.continue')}</Button.Text>
            </ButtonDisabledWhenOffline>
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
                <OnboardingHeader
                    onBackButtonPress={() => Navigation.goBack(ROUTES.ONBOARDING_INTERESTED_FEATURES.getRoute())}
                    shouldCollapseOnKeyboard
                />
                <View style={[onboardingIsMediumOrLargerScreenWidth && styles.mt5, cardPaddingHorizontal]}>
                    <Text
                        style={[styles.textHeadlineH1, styles.mb5]}
                        accessibilityRole={CONST.ROLE.HEADER}
                    >
                        {translate('onboarding.accounting.title')}
                    </Text>
                </View>
            </CollapsibleHeaderOnKeyboard>
            <View style={[cardPaddingHorizontal, styles.mb3]}>
                <CompactSearchBar
                    label={translate('common.search')}
                    inputValue={searchQuery}
                    onChangeText={setSearchQuery}
                    style={styles.mh0}
                />
            </View>
            <ScrollView
                contentContainerStyle={[cardPaddingHorizontal, styles.flexGrow1, styles.pb5]}
                keyboardShouldPersistTaps="handled"
            >
                {filteredOptions.length > 0 ? (
                    <View style={[styles.flexRow, styles.flexWrap, styles.gap3]}>
                        {filteredOptions.map((option) => (
                            <AccountingOptionRow
                                key={option.name}
                                option={option}
                                isSelected={option.name === (selectedOption?.name ?? customOption?.name)}
                                onSelect={selectIntegration}
                            />
                        ))}
                    </View>
                ) : (
                    <View style={[styles.flex1, styles.alignItemsCenter, styles.justifyContentCenter, styles.pv8]}>
                        <Icon
                            src={illustrations.Computer}
                            width={variables.onboardingAccountingIllustrationWidth}
                            height={variables.onboardingAccountingIllustrationHeight}
                        />
                        <Text style={[styles.textHeadlineH2, styles.textAlignCenter, styles.mt5]}>{unsupportedTitle}</Text>
                        <Text style={[styles.textSupporting, styles.textAlignCenter, styles.mt2, styles.mb5]}>{unsupportedSubtitle}</Text>
                        <Button
                            onPress={() => selectIntegration({name: trimmedQuery, integration: 'other', iconName: 'Building'})}
                            sentryLabel={CONST.SENTRY_LABEL.ONBOARDING.ACCOUNTING_CONFIRM_SOFTWARE}
                        >
                            <Button.Text>{confirmSoftwareLabel}</Button.Text>
                        </Button>
                    </View>
                )}
                {shouldFooterBeInsideScrollView && <View style={styles.pt8}>{continueButton}</View>}
            </ScrollView>
            {!shouldFooterBeInsideScrollView && <FixedFooter style={[styles.pt3, cardPaddingHorizontal]}>{continueButton}</FixedFooter>}
        </ScreenWrapper>
    );
}

export default BaseOnboardingAccounting;
