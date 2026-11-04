import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
import FullScreenWebView from '@components/FullScreenWebView';
import ScreenWrapper from '@components/ScreenWrapper';

import useDynamicBackPath from '@hooks/useDynamicBackPath';
import useOnyx from '@hooks/useOnyx';

import createDynamicRoute from '@libs/Navigation/helpers/dynamicRoutesUtils/createDynamicRoute';
import stripDynamicRouteSuffixFromPath from '@libs/Navigation/helpers/dynamicRoutesUtils/stripDynamicRouteSuffixFromPath';

import Navigation from '@navigation/Navigation';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import {DYNAMIC_ROUTES} from '@src/ROUTES';

import type {ShouldStartLoadRequest} from 'react-native-webview/lib/WebViewTypes';

import React from 'react';

/** Reads how Wise's form ended from a navigation that leaves Wise's site for the redirect URL, or returns null for any other navigation */
function getRedirectStatus(url: string, formURL: string): string | null {
    try {
        const {host, searchParams} = new URL(url);
        return host === new URL(formURL).host ? null : searchParams.get(CONST.WISE.KYC_REVIEW_REDIRECT_STATUS_PARAM);
    } catch {
        return null;
    }
}

/** Shows Wise's hosted KYC form in a WebView, as Wise's mobile guides describe, and closes it when the form ends */
function WiseKYCReviewPage() {
    const [kycReviewURL] = useOnyx(ONYXKEYS.RAM_ONLY_WISE_KYC_REVIEW_EMBEDDED_LINK, {selector: (embeddedLink) => embeddedLink?.url});
    const backPath = useDynamicBackPath(DYNAMIC_ROUTES.WISE_KYC_REVIEW.path);

    const goBack = () => Navigation.goBack(backPath);

    // Wise ends the form by redirecting to our redirect URL with the outcome in a query param, so the WebView stops there instead of loading that page
    const closeFormOnRedirect = ({url}: ShouldStartLoadRequest) => {
        const status = kycReviewURL ? getRedirectStatus(url, kycReviewURL) : null;
        if (!status) {
            return true;
        }
        if (status !== CONST.WISE.KYC_REVIEW_REDIRECT_STATUS_SUCCESS) {
            goBack();
            return false;
        }
        // The status page replaces the form, so back from it does not reopen the form, and applies Wise's outcome like after Wise's redirect on web
        const introPath = stripDynamicRouteSuffixFromPath(backPath, DYNAMIC_ROUTES.WISE_MORE_INFO_NEEDED.path);
        Navigation.navigate(createDynamicRoute(DYNAMIC_ROUTES.WISE_ONBOARDING_STATUS.getRoute(status), introPath), {forceReplace: true});
        return false;
    };

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
