import React from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import useOnyx from '@hooks/useOnyx';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import AccountUtils from '@libs/AccountUtils';
import Navigation from '@libs/Navigation/Navigation';
import {isAgentEmail} from '@libs/SessionUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Account, Session} from '@src/types/onyx';
import callOrReturn from '@src/types/utils/callOrReturn';
import FullPageNotFoundView from './BlockingViews/FullPageNotFoundView';

type AccessContext = {
    account: OnyxEntry<Account>;
    session: OnyxEntry<Session>;
};

const DENIED_ACCESS_VARIANTS = {
    // To Restrict All Delegates From Accessing The Page.
    [CONST.DELEGATE.DENIED_ACCESS_VARIANTS.DELEGATE]: ({account}: AccessContext) => isDelegate(account),
    // To Restrict Only Limited Access Delegates From Accessing The Page.
    [CONST.DELEGATE.DENIED_ACCESS_VARIANTS.SUBMITTER]: ({account}: AccessContext) => isSubmitter(account),
    // To Restrict Agent Accounts From Accessing The Page.
    [CONST.DELEGATE.DENIED_ACCESS_VARIANTS.AGENT]: ({session}: AccessContext) => isAgentEmail(session?.email),
} as const satisfies Record<string, (context: AccessContext) => boolean>;

type AccessDeniedVariants = keyof typeof DENIED_ACCESS_VARIANTS;

type DelegateNoAccessWrapperProps = {
    accessDeniedVariants?: AccessDeniedVariants[];
    shouldForceFullScreen?: boolean;
    children?: (() => React.ReactNode) | React.ReactNode;
    onBackButtonPress?: () => void;
};

function isDelegate(account: OnyxEntry<Account>) {
    const isActingAsDelegate = !!account?.delegatedAccess?.delegate;
    return isActingAsDelegate;
}

function isSubmitter(account: OnyxEntry<Account>) {
    const isDelegateOnlySubmitter = AccountUtils.isDelegateOnlySubmitter(account);
    return isDelegateOnlySubmitter;
}

function DelegateNoAccessWrapper({accessDeniedVariants = [], shouldForceFullScreen, onBackButtonPress, ...props}: DelegateNoAccessWrapperProps) {
    const [account] = useOnyx(ONYXKEYS.ACCOUNT);
    const [session] = useOnyx(ONYXKEYS.SESSION);
    const isPageAccessDenied = accessDeniedVariants.reduce((acc, variant) => {
        const accessDeniedFunction = DENIED_ACCESS_VARIANTS[variant];
        return acc || accessDeniedFunction({account, session});
    }, false);
    const {shouldUseNarrowLayout} = useResponsiveLayout();

    if (isPageAccessDenied) {
        return (
            <FullPageNotFoundView
                shouldShow
                shouldForceFullScreen={shouldForceFullScreen}
                onBackButtonPress={() => {
                    if (onBackButtonPress) {
                        onBackButtonPress();
                        return;
                    }
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
