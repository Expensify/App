import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {View} from 'react-native';
import type {SvgProps} from 'react-native-svg';
import Button from '@components/Button';
import FixedFooter from '@components/FixedFooter';
import FormHelpMessage from '@components/FormHelpMessage';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import Icon from '@components/Icon';
import * as Expensicons from '@components/Icon/Expensicons';
import {PressableWithoutFeedback} from '@components/Pressable';
import RadioButtonWithLabel from '@components/RadioButtonWithLabel';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import type {ListItem} from '@components/SelectionList/types';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import usePrevious from '@hooks/usePrevious';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import {openOldDotLink} from '@libs/actions/Link';
import {setOnboardingAdminsChatReportID, setOnboardingPolicyID, setOnboardingUserReportedIntegration} from '@libs/actions/Welcome';
import Navigation from '@libs/Navigation/Navigation';
import {waitForIdle} from '@libs/Network/SequentialQueue';
import {shouldOnboardingRedirectToOldDot} from '@libs/OnboardingUtils';
import {isPaidGroupPolicy, isPolicyAdmin} from '@libs/PolicyUtils';
import variables from '@styles/variables';
import {closeReactNativeApp} from '@userActions/HybridApp';
import CONFIG from '@src/CONFIG';
import type {OnboardingAccounting} from '@src/CONST';
import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {BaseOnboardingAccountingProps} from './types';

type Integration = {
    key: OnboardingAccounting;
    icon: React.FC<SvgProps>;
    translationKey: TranslationPaths;
};

const integrations: Integration[] = [
    {
        key: 'quickbooksOnline',
        icon: Expensicons.QBOCircle,
        translationKey: 'workspace.accounting.qbo',
    },
    {
        key: 'quickbooksDesktop',
        icon: Expensicons.QBDSquare,
        translationKey: 'workspace.accounting.qbd',
    },
    {
        key: 'xero',
        icon: Expensicons.XeroCircle,
        translationKey: 'workspace.accounting.xero',
    },
    {
        key: 'netsuite',
        icon: Expensicons.NetSuiteSquare,
        translationKey: 'workspace.accounting.netsuite',
    },
    {
        key: 'intacct',
        icon: Expensicons.IntacctSquare,
        translationKey: 'workspace.accounting.intacct',
    },
    {
        key: 'sap',
        icon: Expensicons.SapSquare,
        translationKey: 'workspace.accounting.sap',
    },
    {
        key: 'oracle',
        icon: Expensicons.OracleSquare,
        translationKey: 'workspace.accounting.oracle',
    },
    {
        key: 'microsoftDynamics',
        icon: Expensicons.MicrosoftDynamicsSquare,
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

    // We need to use isSmallScreenWidth, see navigateAfterOnboarding function comment
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth
    const {onboardingIsMediumOrLargerScreenWidth, isSmallScreenWidth} = useResponsiveLayout();
    const [onboardingPolicyID] = useOnyx(ONYXKEYS.ONBOARDING_POLICY_ID, {canBeMissing: true});
    const [allPolicies] = useOnyx(ONYXKEYS.COLLECTION.POLICY, {canBeMissing: false});
    const [onboardingCompanySize] = useOnyx(ONYXKEYS.ONBOARDING_COMPANY_SIZE, {canBeMissing: true});
    const [session] = useOnyx(ONYXKEYS.SESSION, {canBeMissing: false});

    const [onboardingUserReportedIntegration] = useOnyx(ONYXKEYS.ONBOARDING_USER_REPORTED_INTEGRATION, {canBeMissing: true});

    const [userReportedIntegration, setUserReportedIntegration] = useState<OnboardingAccounting | undefined>(onboardingUserReportedIntegration ?? undefined);
    const [error, setError] = useState('');

    const paidGroupPolicy = Object.values(allPolicies ?? {}).find((policy) => isPaidGroupPolicy(policy) && isPolicyAdmin(policy, session?.email));
    const [onboarding] = useOnyx(ONYXKEYS.NVP_ONBOARDING, {canBeMissing: true});
    const {isOffline} = useNetwork();
    const isLoading = onboarding?.isLoading;
    const prevIsLoading = usePrevious(isLoading);

    const isVsb = onboarding?.signupQualifier === CONST.ONBOARDING_SIGNUP_QUALIFIERS.VSB;

    // Set onboardingPolicyID and onboardingAdminsChatReportID if a workspace is created by the backend for OD signup
    useEffect(() => {
        if (!paidGroupPolicy || onboardingPolicyID) {
            return;
        }
        setOnboardingAdminsChatReportID(paidGroupPolicy.chatReportIDAdmins?.toString());
        setOnboardingPolicyID(paidGroupPolicy.id);
    }, [paidGroupPolicy, onboardingPolicyID]);

    useEffect(() => {
        if (!!isLoading || !prevIsLoading) {
            return;
        }

        if (CONFIG.IS_HYBRID_APP) {
            closeReactNativeApp({shouldSignOut: false, shouldSetNVP: true});
            return;
        }
        waitForIdle().then(() => {
            openOldDotLink(CONST.OLDDOT_URLS.INBOX, true);
        });
    }, [isLoading, prevIsLoading]);

    const accountingOptions: OnboardingListItem[] = useMemo(() => {
        const createAccountingOption = (integration: Integration): OnboardingListItem => ({
            keyForList: integration.key,
            text: translate(integration.translationKey),
            leftElement: (
                <Icon
                    src={integration.icon}
                    width={variables.iconSizeExtraLarge}
                    height={variables.iconSizeExtraLarge}
                    additionalStyles={[StyleUtils.getAvatarBorderStyle(CONST.AVATAR_SIZE.DEFAULT, CONST.ICON_TYPE_AVATAR), styles.mr3]}
                />
            ),
            isSelected: userReportedIntegration === integration.key,
        });

        const noneAccountingOption: OnboardingListItem = {
            keyForList: null,
            text: translate('onboarding.accounting.none'),
            leftElement: (
                <Icon
                    src={Expensicons.CircleSlash}
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
                    src={Expensicons.Connect}
                    width={variables.iconSizeNormal}
                    height={variables.iconSizeNormal}
                    fill={theme.icon}
                    additionalStyles={[StyleUtils.getAvatarBorderStyle(CONST.AVATAR_SIZE.DEFAULT, CONST.ICON_TYPE_AVATAR), styles.mr3, styles.onboardingSmallIcon]}
                />
            ),
            isSelected: userReportedIntegration === 'other',
        };

        return [...integrations.map(createAccountingOption), othersAccountingOption, noneAccountingOption];
    }, [StyleUtils, styles.mr3, styles.onboardingSmallIcon, theme.icon, translate, userReportedIntegration]);

    const handleContinue = useCallback(() => {
        if (userReportedIntegration === undefined) {
            setError(translate('onboarding.errorSelection'));
            return;
        }

        setOnboardingUserReportedIntegration(userReportedIntegration);

        // Navigate to the next onboarding step with the selected integration
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
            />
            <View style={[onboardingIsMediumOrLargerScreenWidth && styles.mt5, onboardingIsMediumOrLargerScreenWidth ? styles.mh8 : styles.mh5]}>
                <Text style={[styles.textHeadlineH1, styles.mb5]}>{translate('onboarding.accounting.title')}</Text>
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
                    isLoading={isLoading}
                    isDisabled={isOffline && shouldOnboardingRedirectToOldDot(onboardingCompanySize, userReportedIntegration)}
                    pressOnEnter
                />
            </FixedFooter>
        </ScreenWrapper>
    );
}

BaseOnboardingAccounting.displayName = 'BaseOnboardingAccounting';

export default BaseOnboardingAccounting;
