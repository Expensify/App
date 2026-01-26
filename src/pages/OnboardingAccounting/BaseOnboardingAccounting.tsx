import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {View} from 'react-native';
import Button from '@components/Button';
import FixedFooter from '@components/FixedFooter';
import FormHelpMessage from '@components/FormHelpMessage';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import Icon from '@components/Icon';
import {PressableWithoutFeedback} from '@components/Pressable';
import RadioButtonWithLabel from '@components/RadioButtonWithLabel';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import type {ListItem} from '@components/SelectionListWithSections/types';
import Text from '@components/Text';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import {setOnboardingAdminsChatReportID, setOnboardingPolicyID, setOnboardingUserReportedIntegration} from '@libs/actions/Welcome';
import Navigation from '@libs/Navigation/Navigation';
import {isPaidGroupPolicy, isPolicyAdmin} from '@libs/PolicyUtils';
import variables from '@styles/variables';
import type {OnboardingAccounting} from '@src/CONST';
import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type IconAsset from '@src/types/utils/IconAsset';
import type {BaseOnboardingAccountingProps} from './types';

type Integration = {
    key: OnboardingAccounting;
    iconName: 'QBOCircle' | 'QBDSquare' | 'XeroCircle' | 'NetSuiteSquare' | 'IntacctSquare' | 'SapSquare' | 'OracleSquare' | 'MicrosoftDynamicsSquare';
    translationKey: TranslationPaths;
};

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

type OnboardingListItem = ListItem & {
    keyForList: OnboardingAccounting;
};

function BaseOnboardingAccounting({shouldUseNativeStyles, route}: BaseOnboardingAccountingProps) {
    const styles = useThemeStyles();
    const theme = useTheme();
    const StyleUtils = useStyleUtils();
    const {translate} = useLocalize();
    const expensifyIcons = useMemoizedLazyExpensifyIcons([
        'CircleSlash',
        'Connect',
        'QBOCircle',
        'QBDSquare',
        'XeroCircle',
        'NetSuiteSquare',
        'IntacctSquare',
        'SapSquare',
        'OracleSquare',
        'MicrosoftDynamicsSquare',
    ] as const);
    // We need to use isSmallScreenWidth, see navigateAfterOnboarding function comment
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth
    const {onboardingIsMediumOrLargerScreenWidth, isSmallScreenWidth} = useResponsiveLayout();
    const [onboardingPolicyID] = useOnyx(ONYXKEYS.ONBOARDING_POLICY_ID, {canBeMissing: true});
    const [allPolicies] = useOnyx(ONYXKEYS.COLLECTION.POLICY, {canBeMissing: false});
    const [session] = useOnyx(ONYXKEYS.SESSION, {canBeMissing: false});
    const [onboardingUserReportedIntegration] = useOnyx(ONYXKEYS.ONBOARDING_USER_REPORTED_INTEGRATION, {canBeMissing: true});

    const [userReportedIntegration, setUserReportedIntegration] = useState<OnboardingAccounting | undefined>(onboardingUserReportedIntegration ?? undefined);
    const [error, setError] = useState('');

    const paidGroupPolicy = Object.values(allPolicies ?? {}).find((policy) => isPaidGroupPolicy(policy) && isPolicyAdmin(policy, session?.email));
    const [onboarding] = useOnyx(ONYXKEYS.NVP_ONBOARDING, {canBeMissing: true});

    const isVsb = onboarding?.signupQualifier === CONST.ONBOARDING_SIGNUP_QUALIFIERS.VSB;

    // Set onboardingPolicyID and onboardingAdminsChatReportID if a workspace is created by the backend for OD signup
    useEffect(() => {
        if (!paidGroupPolicy || onboardingPolicyID) {
            return;
        }
        setOnboardingAdminsChatReportID(paidGroupPolicy.chatReportIDAdmins?.toString());
        setOnboardingPolicyID(paidGroupPolicy.id);
    }, [paidGroupPolicy, onboardingPolicyID]);

    const accountingOptions: OnboardingListItem[] = useMemo(() => {
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
                isSelected: userReportedIntegration === integration.key,
            };
        };

        const noneAccountingOption: OnboardingListItem = {
            keyForList: null,
            text: translate('onboarding.accounting.none'),
            leftElement: (
                <Icon
                    src={expensifyIcons.CircleSlash}
                    width={variables.iconSizeNormal}
                    height={variables.iconSizeNormal}
                    fill={theme.icon}
                    additionalStyles={[StyleUtils.getAvatarBorderStyle(CONST.AVATAR_SIZE.DEFAULT, CONST.ICON_TYPE_AVATAR), styles.mr3, styles.onboardingSmallIcon]}
                />
            ),
            isSelected: userReportedIntegration === null,
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
            isSelected: userReportedIntegration === 'other',
        };

        return [...integrations.map(createAccountingOption), othersAccountingOption, noneAccountingOption];
    }, [StyleUtils, styles.mr3, styles.onboardingSmallIcon, theme.icon, translate, userReportedIntegration, expensifyIcons]);

    const handleContinue = useCallback(() => {
        if (userReportedIntegration === undefined) {
            setError(translate('onboarding.errorSelection'));
            return;
        }

        setOnboardingUserReportedIntegration(userReportedIntegration);

        // Navigate to the next onboarding step interested features with the selected integration
        Navigation.navigate(ROUTES.ONBOARDING_INTERESTED_FEATURES.getRoute(route.params?.backTo));
    }, [translate, userReportedIntegration, route.params?.backTo]);

    const handleIntegrationSelect = useCallback((integrationKey: OnboardingAccounting | null) => {
        setUserReportedIntegration(integrationKey);
        setError('');
    }, []);

    const renderOption = useCallback(
        (item: OnboardingListItem) => (
            <PressableWithoutFeedback
                key={item.keyForList ?? ''}
                onPress={() => handleIntegrationSelect(item.keyForList)}
                accessibilityLabel={item.text}
                accessible={false}
                hoverStyle={!item.isSelected ? styles.hoveredComponentBG : undefined}
                style={[styles.onboardingAccountingItem, isSmallScreenWidth && styles.flexBasis100, item.isSelected && styles.activeComponentBG]}
            >
                <RadioButtonWithLabel
                    isChecked={!!item.isSelected}
                    onPress={() => handleIntegrationSelect(item.keyForList)}
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
        ),
        [
            handleIntegrationSelect,
            isSmallScreenWidth,
            styles.alignItemsCenter,
            styles.flexBasis100,
            styles.flexRow,
            styles.flexRowReverse,
            styles.ml0,
            styles.onboardingAccountingItem,
            styles.textStrong,
            styles.hoveredComponentBG,
            styles.activeComponentBG,
        ],
    );

    return (
        <ScreenWrapper
            testID="BaseOnboardingAccounting"
            style={[styles.defaultModalContainer, shouldUseNativeStyles && styles.pt8]}
            shouldEnableMaxHeight
        >
            <HeaderWithBackButton
                shouldShowBackButton={!isVsb}
                progressBarPercentage={80}
                onBackButtonPress={() => Navigation.goBack(ROUTES.ONBOARDING_EMPLOYEES.getRoute())}
                shouldDisplayHelpButton={false}
            />
            <View style={[onboardingIsMediumOrLargerScreenWidth && styles.mt5, onboardingIsMediumOrLargerScreenWidth ? styles.mh8 : styles.mh5]}>
                <Text
                    style={[styles.textHeadlineH1, styles.mb5]}
                    accessibilityRole="header"
                >
                    {translate('onboarding.accounting.title')}
                </Text>
            </View>
            <ScrollView style={[onboardingIsMediumOrLargerScreenWidth ? styles.mh8 : styles.mh5, styles.pt3, styles.pb8]}>
                <View style={[styles.flexRow, styles.flexWrap, styles.gap3, styles.mb3]}>{accountingOptions.map(renderOption)}</View>
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
                    pressOnEnter
                />
            </FixedFooter>
        </ScreenWrapper>
    );
}

export default BaseOnboardingAccounting;
