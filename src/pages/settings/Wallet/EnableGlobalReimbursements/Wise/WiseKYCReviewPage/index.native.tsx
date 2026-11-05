import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
import FullScreenWebView from '@components/FullScreenWebView';
import ScreenWrapper from '@components/ScreenWrapper';

import useDynamicBackPath from '@hooks/useDynamicBackPath';
import useEnvironment from '@hooks/useEnvironment';
import useOnyx from '@hooks/useOnyx';

import stripDynamicRouteSuffixFromPath from '@libs/Navigation/helpers/dynamicRoutesUtils/stripDynamicRouteSuffixFromPath';
import getWiseOnboardingStatusRoute from '@libs/Navigation/helpers/getWiseOnboardingStatusRoute';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import openExternalLink from '@libs/openExternalLink';

import Navigation from '@navigation/Navigation';
import type {SettingsNavigatorParamList} from '@navigation/types';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import {DYNAMIC_ROUTES} from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

import type {ShouldStartLoadRequest, WebViewOpenWindowEvent} from 'react-native-webview/lib/WebViewTypes';

import React from 'react';

type WiseKYCReviewPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.SETTINGS.WALLET.DYNAMIC_WISE_KYC_REVIEW>;

/** Reads how Wise's form ended from a navigation to our redirect URL, or returns null for any other navigation, including links to other sites */
function getRedirectStatus(url: string, environmentURL: string): string | null {
    try {
        const {host, searchParams} = new URL(url);
        return host === new URL(environmentURL).host ? searchParams.get(CONST.WISE.KYC_REVIEW_REDIRECT_STATUS_PARAM) : null;
    } catch {
        return null;
    }
}

/** Shows Wise's hosted KYC form in a WebView, as Wise's mobile guides describe, and closes it when the form ends */
function WiseKYCReviewPage({route}: WiseKYCReviewPageProps) {
    const [kycReviewURL] = useOnyx(ONYXKEYS.RAM_ONLY_WISE_KYC_REVIEW_EMBEDDED_LINK, {selector: (embeddedLink) => embeddedLink?.url});
    const bankAccountID = Number(route.params.bankAccountID);
    const statusPathOnStack = useDynamicBackPath(DYNAMIC_ROUTES.WISE_KYC_REVIEW.path);
    // Wallet and Home open the status page without the intro on the stack, so only the entry screen is read from the stack and the rest of the path is built
    const entryPath = stripDynamicRouteSuffixFromPath(
        stripDynamicRouteSuffixFromPath(statusPathOnStack, DYNAMIC_ROUTES.WISE_ONBOARDING_STATUS.path),
        DYNAMIC_ROUTES.WISE_GLOBAL_REIMBURSEMENTS_INTRO.path,
    );
    const {environmentURL} = useEnvironment();

    const goBack = () => Navigation.goBack(getWiseOnboardingStatusRoute(bankAccountID, entryPath));

    // Wise ends the form by redirecting to our redirect URL with the outcome in a query param, so the WebView stops there instead of loading that page
    const closeFormOnRedirect = ({url, isTopFrame}: ShouldStartLoadRequest) => {
        // iOS also asks about iframe loads, which must not close the form. Android leaves isTopFrame out, so only an explicit false is an iframe
        const status = isTopFrame !== false ? getRedirectStatus(url, environmentURL) : null;
        if (!status) {
            return true;
        }
        // The status page underneath applies the outcome, the same way it does after Wise's redirect on web
        Navigation.goBack(getWiseOnboardingStatusRoute(bankAccountID, entryPath, status), {compareParams: false});
        return false;
    };

    // Without a handler, iOS loads a new window's link in place of the form and Android drops it, so links such as Wise's terms open in the browser instead
    const openNewWindowInBrowser = ({nativeEvent}: WebViewOpenWindowEvent) => openExternalLink(nativeEvent.targetUrl);

    return (
        <ScreenWrapper
            testID="WiseKYCReviewPage"
            shouldEnableMaxHeight
        >
            {/* The link lives only in memory, so a restored or deep linked screen has no form to show */}
            <FullPageNotFoundView
                shouldShow={!kycReviewURL}
                onBackButtonPress={goBack}
            >
                {/* Wise's form has its own header with a close button, so it takes the whole screen */}
                <FullScreenWebView
                    source={{uri: kycReviewURL ?? ''}}
                    onShouldStartLoadWithRequest={closeFormOnRedirect}
                    onOpenWindow={openNewWindowInBrowser}
                    // The form holds identity documents, so its cookies and cache do not outlive the screen
                    incognito
                    // The form's ID document step films the user, so the camera preview has to play inline, and Wise's own host gets the camera without a second prompt
                    allowsInlineMediaPlayback
                    mediaCapturePermissionGrantType="grantIfSameHostElsePrompt"
                    onGoBack={goBack}
                />
            </FullPageNotFoundView>
        </ScreenWrapper>
    );
}

export default WiseKYCReviewPage;
