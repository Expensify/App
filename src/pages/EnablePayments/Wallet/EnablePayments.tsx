import React, {useEffect, useMemo} from 'react';
import {View} from 'react-native';
import type {ValueOf} from 'type-fest';
import FullScreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import {hasExpensifyPaymentMethod} from '@libs/PaymentUtils';
import type {SkeletonSpanReasonAttributes} from '@libs/telemetry/useSkeletonSpan';
import FailedKYC from '@pages/EnablePayments/shared/FailedKYC';
import {openEnablePaymentsPage} from '@userActions/Wallet';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import AddBankAccount from './AddBankAccount/AddBankAccount';
import FeesAndTerms from './FeesAndTerms/FeesAndTerms';
import PersonalInfo from './PersonalInfo/PersonalInfo';
import VerifyIdentity from './VerifyIdentity/VerifyIdentity';

const PAGE_NAMES = CONST.ENABLE_PAYMENTS.PAGE_NAMES;
const ADD_BANK_ACCOUNT_SUB_PAGES = CONST.ENABLE_PAYMENTS.ADD_BANK_ACCOUNT_STEP.SUB_PAGE_NAMES;
const PERSONAL_INFO_SUB_PAGES = CONST.ENABLE_PAYMENTS.PERSONAL_INFO_STEP.SUB_PAGE_NAMES;
const FEES_AND_TERMS_SUB_PAGES = CONST.ENABLE_PAYMENTS.FEES_AND_TERMS_STEP.SUB_PAGE_NAMES;

type PageEntry = {
    pageName: string;
    component: React.ComponentType;
    firstSubPage?: string;
    serverSteps: Array<ValueOf<typeof CONST.WALLET.STEP>>;
};

const pages: PageEntry[] = [
    {
        pageName: PAGE_NAMES.ADD_BANK_ACCOUNT,
        component: AddBankAccount,
        firstSubPage: ADD_BANK_ACCOUNT_SUB_PAGES.PLAID,
        serverSteps: [CONST.WALLET.STEP.ADD_BANK_ACCOUNT],
    },
    {
        pageName: PAGE_NAMES.PERSONAL_INFO,
        component: PersonalInfo,
        firstSubPage: PERSONAL_INFO_SUB_PAGES.LEGAL_NAME,
        serverSteps: [CONST.WALLET.STEP.ADDITIONAL_DETAILS, CONST.WALLET.STEP.ADDITIONAL_DETAILS_KBA],
    },
    {
        pageName: PAGE_NAMES.VERIFY_IDENTITY,
        component: VerifyIdentity,
        serverSteps: [CONST.WALLET.STEP.ONFIDO],
    },
    {
        pageName: PAGE_NAMES.FEES_AND_TERMS,
        component: FeesAndTerms,
        firstSubPage: FEES_AND_TERMS_SUB_PAGES.FEES,
        serverSteps: [CONST.WALLET.STEP.TERMS],
    },
];

type EnablePaymentsPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.SETTINGS.WALLET.ENABLE_PAYMENTS>;

function EnablePaymentsPage({route}: EnablePaymentsPageProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {isOffline} = useNetwork();
    const [userWallet] = useOnyx(ONYXKEYS.USER_WALLET);
    const [bankAccountList] = useOnyx(ONYXKEYS.BANK_ACCOUNT_LIST);
    const [fundList] = useOnyx(ONYXKEYS.FUND_LIST);
    const paymentCardList = fundList ?? {};

    const [hasFreshData] = useOnyx(ONYXKEYS.RAM_ONLY_HAS_FRESH_WALLET_DATA);

    const urlPage = route.params?.page;

    useEffect(() => {
        if (isOffline) {
            return;
        }
        if (hasFreshData) {
            return;
        }
        if (userWallet?.isLoading) {
            return;
        }

        openEnablePaymentsPage();
        // userWallet.isLoading is intentionally omitted from the dependencies,
        // as reacting to it would endlessly retry a failed fetch
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOffline, hasFreshData]);

    const hasActivatedWallet = ([CONST.WALLET.TIER_NAME.GOLD, CONST.WALLET.TIER_NAME.PLATINUM] as string[]).includes(userWallet?.tierName ?? '');
    const userWalletCurrentStep = userWallet?.currentStep ? userWallet.currentStep : CONST.WALLET.STEP.ADDITIONAL_DETAILS;
    const enablePaymentsStep = !hasExpensifyPaymentMethod(paymentCardList, bankAccountList ?? {}, hasActivatedWallet) ? CONST.WALLET.STEP.ADD_BANK_ACCOUNT : userWalletCurrentStep;

    const canonicalPage = useMemo(() => pages.find((p) => p.serverSteps.includes(enablePaymentsStep))?.pageName, [enablePaymentsStep]);

    useEffect(() => {
        if (userWallet?.isLoading || (!hasFreshData && !isOffline)) {
            return;
        }

        if (!canonicalPage || urlPage === canonicalPage) {
            return;
        }

        // This is a URL correction, so replace the current route instead of pushing a duplicate instance of this screen.
        Navigation.navigate(ROUTES.SETTINGS_ENABLE_PAYMENTS.getRoute({page: canonicalPage}), {forceReplace: true});
    }, [canonicalPage, hasFreshData, isOffline, urlPage, userWallet?.isLoading]);

    const isUserWalletEmpty = isEmptyObject(userWallet);
    if (isUserWalletEmpty || userWallet?.isLoading || (!hasFreshData && !isOffline)) {
        const reasonAttributes: SkeletonSpanReasonAttributes = {
            context: 'EnablePaymentsPage',
            isUserWalletEmpty,
        };
        return <FullScreenLoadingIndicator reasonAttributes={reasonAttributes} />;
    }

    if (userWallet?.errorCode === CONST.WALLET.ERROR.KYC) {
        return (
            <ScreenWrapper
                testID="EnablePaymentsPage"
                includeSafeAreaPaddingBottom={false}
                shouldEnablePickerAvoiding={false}
            >
                <HeaderWithBackButton
                    title={translate('personalInfoStep.personalInfo')}
                    onBackButtonPress={() => Navigation.goBack(ROUTES.SETTINGS_WALLET)}
                />
                <FailedKYC />
            </ScreenWrapper>
        );
    }

    const currentEntry = pages.find((p) => p.pageName === urlPage) ?? pages.find((p) => p.pageName === canonicalPage);
    const CurrentPage = currentEntry?.component;
    if (!CurrentPage) {
        return null;
    }
    return (
        <View style={styles.flex1}>
            <CurrentPage />
        </View>
    );
}

export default EnablePaymentsPage;
