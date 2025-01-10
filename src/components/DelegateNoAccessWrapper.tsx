import React from 'react';
import {useOnyx} from 'react-native-onyx';
import type {OnyxEntry} from 'react-native-onyx';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import AccountUtils from '@libs/AccountUtils';
import Navigation from '@libs/Navigation/Navigation';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Account} from '@src/types/onyx';
import callOrReturn from '@src/types/utils/callOrReturn';
import FullPageNotFoundView from './BlockingViews/FullPageNotFoundView';

const DENIED_ACCESS_VARIANTS = {
    // To Restrict All Delegates From Accessing The Page.
    [CONST.DELEGATE.DENIED_ACCESS_VARIANTS.DELEGATE]: (account: OnyxEntry<Account>) => isDelegate(account),
    // To Restrict Only Limited Access Delegates From Accessing The Page.
    [CONST.DELEGATE.DENIED_ACCESS_VARIANTS.SUBMITTER]: (account: OnyxEntry<Account>) => isSubmitter(account),
} as const satisfies Record<string, (account: OnyxEntry<Account>) => boolean>;

type AccessDeniedVariants = keyof typeof DENIED_ACCESS_VARIANTS;

type DelegateNoAccessWrapperProps = {
    accessDeniedVariants?: AccessDeniedVariants[];
    shouldForceFullScreen?: boolean;
    children?: (() => React.ReactNode) | React.ReactNode;
};

function isDelegate(account: OnyxEntry<Account>) {
    const isActingAsDelegate = !!account?.delegatedAccess?.delegate;
    return isActingAsDelegate;
}

function isSubmitter(account: OnyxEntry<Account>) {
    const isDelegateOnlySubmitter = AccountUtils.isDelegateOnlySubmitter(account);
    return isDelegateOnlySubmitter;
}

function DelegateNoAccessWrapper({accessDeniedVariants = [], shouldForceFullScreen, ...props}: DelegateNoAccessWrapperProps) {
    const [account] = useOnyx(ONYXKEYS.ACCOUNT);
    const isPageAccessDenied = accessDeniedVariants.reduce((acc, variant) => {
        const accessDeniedFunction = DENIED_ACCESS_VARIANTS[variant];
        return acc || accessDeniedFunction(account);
    }, false);
    const {shouldUseNarrowLayout} = useResponsiveLayout();

    if (isPageAccessDenied) {
        return (
            <FullPageNotFoundView
                shouldShow
                shouldForceFullScreen={shouldForceFullScreen}
                onBackButtonPress={() => {
                    if (shouldUseNarrowLayout) {
                        Navigation.dismissModal();
                        return;
                    }
                    Navigation.goBack();
                }}
                titleKey="delegate.notAllowed"
                subtitleKey="delegate.noAccessMessage"
                shouldShowLink={false}
            />
        );
    }
    return callOrReturn(props.children);
}

export default DelegateNoAccessWrapper;
