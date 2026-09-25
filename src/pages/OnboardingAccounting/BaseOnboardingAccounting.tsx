import Button from '@components/Button';
import ButtonDisabledWhenOffline from '@components/Button/composed/ButtonDisabledWhenOffline';
import CollapsibleHeaderOnKeyboard from '@components/CollapsibleHeaderOnKeyboard';
import FixedFooter from '@components/FixedFooter';
import FormHelpMessage from '@components/FormHelpMessage';
import Icon from '@components/Icon';
import type {ExpensifyIconName} from '@components/Icon/ExpensifyIconLoader';
import OnboardingHeader from '@components/OnboardingHeader';
import {PressableWithoutFeedback} from '@components/Pressable';
import RadioButton from '@components/RadioButton';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import Text from '@components/Text';
import TextInput from '@components/TextInput';
import type {BaseTextInputRef} from '@components/TextInput/BaseTextInput/types';

import useCompleteOnboarding from '@hooks/useCompleteOnboarding';
import {useMemoizedLazyExpensifyIcons, useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';

import {setOnboardingAccountingEnabled, setOnboardingAdminsChatReportID, setOnboardingPolicyID, setOnboardingUserReportedIntegration} from '@libs/actions/Welcome';
import {getDefaultOnboardingFeaturesMap} from '@libs/actions/Welcome/OnboardingFeatures';
import {isMobileSafari} from '@libs/Browser';
import Navigation from '@libs/Navigation/Navigation';
import {isGroupPolicy, isPolicyAdmin} from '@libs/PolicyUtils';

import variables from '@styles/variables';

import type {OnboardingAccounting, OnboardingAccountingOption} from '@src/CONST';
import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import ObjectUtils from '@src/types/utils/ObjectUtils';

import type {ComponentRef} from 'react';
// eslint-disable-next-line no-restricted-imports
import type {ScrollView as RNScrollView} from 'react-native';

import React, {useCallback, useEffect, useRef, useState} from 'react';
import {View} from 'react-native';

import type {BaseOnboardingAccountingProps} from './types';

type AccountingIntegrationKey = Exclude<OnboardingAccountingOption, 'other'>;

type AccountingOptionKey = OnboardingAccountingOption;

/**
 * Icon and label for every option in `CONST.ONBOARDING_ACCOUNTING_MAPPING`, which also sets the order of the tiles.
 * `satisfies` is what keeps the two in step: a connection added to the mapping and missing here - or listed here
 * and missing from the mapping - fails typecheck rather than quietly disappearing from this screen.
 */
const accountingIntegrationDetails = {
    quickbooksOnline: {iconName: 'QBOCircle', translationKey: 'workspace.accounting.qbo'},
    intuitEnterpriseSuite: {iconName: 'IntuitSquare', translationKey: 'workspace.accounting.intuitEnterpriseSuite'},
    quickbooksDesktop: {iconName: 'QBDSquare', translationKey: 'workspace.accounting.qbd'},
    xero: {iconName: 'XeroCircle', translationKey: 'workspace.accounting.xero'},
    netsuite: {iconName: 'NetSuiteSquare', translationKey: 'workspace.accounting.netsuite'},
    intacct: {iconName: 'IntacctSquare', translationKey: 'workspace.accounting.intacct'},
    // Certinia has no `workspace.accounting` entry, but its connection page already translates the brand name.
    financialforce: {iconName: 'CertiniaSquare', translationKey: 'workspace.certinia.title'},
    rillet: {iconName: 'RilletSquare', translationKey: 'workspace.accounting.rillet'},
    sap: {iconName: 'SapSquare', translationKey: 'workspace.accounting.sap'},
    oracle: {iconName: 'OracleSquare', translationKey: 'workspace.accounting.oracle'},
    microsoftDynamics: {iconName: 'MicrosoftDynamicsSquare', translationKey: 'workspace.accounting.microsoftDynamics'},
} satisfies Record<AccountingIntegrationKey, {iconName: ExpensifyIconName; translationKey: TranslationPaths}>;

const integrationKeys = ObjectUtils.typedKeys(accountingIntegrationDetails);

const integrationIconNames = integrationKeys.map((integrationKey) => accountingIntegrationDetails[integrationKey].iconName);

const accountingOptionKeys = ObjectUtils.typedKeys(CONST.ONBOARDING_ACCOUNTING_MAPPING);

function isIntegrationKey(integrationKey: OnboardingAccounting | undefined): integrationKey is AccountingIntegrationKey {
    return integrationKeys.some((key) => key === integrationKey);
}

function BaseOnboardingAccounting({shouldUseNativeStyles}: BaseOnboardingAccountingProps) {
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const {translate} = useLocalize();
    // Derived from the option list, so a newly offered integration loads its icon without a second list to update.
    const expensifyIcons = useMemoizedLazyExpensifyIcons(integrationIconNames);
    const illustrations = useMemoizedLazyIllustrations(['Pencil']);
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
    const scrollViewRef = useRef<ComponentRef<typeof RNScrollView>>(null);
    const otherAccountingSoftwareInputRef = useRef<BaseTextInputRef | null>(null);
    const isOtherSelected = selectedIntegration === 'other';

    const groupPolicy = Object.values(allPolicies ?? {}).find((policy) => isGroupPolicy(policy) && isPolicyAdmin(policy, session?.email));
    const {completeOnboardingFlow, isLoading: isCompletingOnboarding} = useCompleteOnboarding();

    // Set onboardingPolicyID and onboardingAdminsChatReportID if a workspace is created by the backend for OD signup
    useEffect(() => {
        if (!groupPolicy || onboardingPolicyID) {
            return;
        }
        setOnboardingAdminsChatReportID(groupPolicy.chatReportIDAdmins?.toString());
        setOnboardingPolicyID(groupPolicy.id);
    }, [groupPolicy, onboardingPolicyID]);

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

    const handleIntegrationSelect = (integrationKey: AccountingOptionKey) => {
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

    function renderOption(optionKey: AccountingOptionKey) {
        const isOtherOption = optionKey === 'other';
        const label = translate(isOtherOption ? 'workspace.accounting.other' : accountingIntegrationDetails[optionKey].translationKey);
        const isSelected = selectedIntegration === optionKey;

        return (
            <PressableWithoutFeedback
                key={optionKey}
                onPress={() => handleIntegrationSelect(optionKey)}
                accessibilityLabel={label}
                sentryLabel={CONST.SENTRY_LABEL.ONBOARDING.ACCOUNTING_SELECT_INTEGRATION}
                accessible={false}
                // The hover background would otherwise paint over the selected tile's green fill.
                hoverStyle={isSelected ? undefined : styles.hoveredComponentBG}
                style={[
                    styles.onboardingAccountingItem,
                    isSmallScreenWidth ? styles.onboardingAccountingItemNarrow : styles.onboardingAccountingItemWide,
                    isSelected && styles.onboardingAccountingItemSelected,
                ]}
            >
                {/* Square like a checkbox to match the mocks, but announced as a radio because only one option can be picked. */}
                <RadioButton
                    isChecked={isSelected}
                    onPress={() => handleIntegrationSelect(optionKey)}
                    accessibilityLabel={label}
                    containerBorderRadius={variables.componentBorderRadiusSmall}
                    wrapperStyle={styles.onboardingAccountingItemSelectionButton}
                />
                <Icon
                    src={isOtherOption ? illustrations.Pencil : expensifyIcons[accountingIntegrationDetails[optionKey].iconName]}
                    width={variables.iconSizeExtraLarge}
                    height={variables.iconSizeExtraLarge}
                    // Unlike the integration logos, the mocks draw the Other illustration without a circular badge behind it.
                    additionalStyles={isOtherOption ? undefined : [StyleUtils.getAvatarBorderStyle(CONST.AVATAR_SIZE.DEFAULT, CONST.AVATAR_SHAPE.CIRCLE)]}
                />
                <Text style={[styles.textLabel, styles.textStrong, styles.textAlignCenter, styles.mt2]}>{label}</Text>
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
                <View style={[styles.flexRow, styles.flexWrap, styles.gap3, styles.mb3]}>{accountingOptionKeys.map(renderOption)}</View>
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
