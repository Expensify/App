import React from 'react';
import {useOnyx} from 'react-native-onyx';
import type {OnyxEntry} from 'react-native-onyx';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import AccountUtils from '@libs/AccountUtils';
import Navigation from '@libs/Navigation/Navigation';
import NotFoundPage from '@pages/ErrorPage/NotFoundPage';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Account} from '@src/types/onyx';
import callOrReturn from '@src/types/utils/callOrReturn';
import type {FullPageNotFoundViewProps} from './BlockingViews/FullPageNotFoundView';

const DENIED_ACCESS_VARIANTS = {
    [CONST.DELEGATE.DENIED_ACCESS_VARIANTS.DELEGATE]: (account: OnyxEntry<Account>) => isDelegate(account),
    [CONST.DELEGATE.DENIED_ACCESS_VARIANTS.SUBMITTER]: (account: OnyxEntry<Account>) => isSubmitter(account),
} as const satisfies Record<string, (account: OnyxEntry<Account>) => boolean>;

type AccessDeniedVariants = keyof typeof DENIED_ACCESS_VARIANTS;

type DelegateNoAccessWrapperProps = {
    accessDeniedVariants?: AccessDeniedVariants[];
    FullPageNotFoundViewProps?: FullPageNotFoundViewProps;
    shouldShowFullScreenFallback?: boolean;
    children: (() => React.ReactNode) | React.ReactNode;
};

type PageNotFoundFallbackProps = {
    shouldShowFullScreenFallback?: boolean;
};

function isDelegate(account: OnyxEntry<Account>) {
    const isActingAsDelegate = !!account?.delegatedAccess?.delegate;
    return isActingAsDelegate;
}

function isSubmitter(account: OnyxEntry<Account>) {
    const isDelegateOnlySubmitter = AccountUtils.isDelegateOnlySubmitter(account);
    return isDelegateOnlySubmitter;
}

function PageNotFoundFallback({shouldShowFullScreenFallback}: PageNotFoundFallbackProps) {
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    return (
        <NotFoundPage
            shouldForceFullScreen={shouldShowFullScreenFallback}
            onBackButtonPress={() => {
                if (shouldShowFullScreenFallback) {
                    Navigation.dismissModal();
                    return;
                }
                Navigation.goBack();
            }}
            shouldShowBackButton={!shouldShowFullScreenFallback ? shouldUseNarrowLayout : undefined}
        />
    );
}

function DelegateNoAccessWrapper({accessDeniedVariants = [], shouldShowFullScreenFallback, ...props}: DelegateNoAccessWrapperProps) {
    const [account] = useOnyx(ONYXKEYS.ACCOUNT);
    const isPageAccessDenied = accessDeniedVariants.reduce((acc, variant) => {
        const accessDeniedFunction = DENIED_ACCESS_VARIANTS[variant];
        return acc || accessDeniedFunction(account);
    }, false);
    if (isPageAccessDenied) {
        return <PageNotFoundFallback shouldShowFullScreenFallback={shouldShowFullScreenFallback} />;
    }
    return callOrReturn(props.children);
}

export default DelegateNoAccessWrapper;
