/** Requires account verification before either copilot access page can mount, including through deep links. */
import DelegateNoAccessWrapper from '@components/DelegateNoAccessWrapper';
import FullscreenLoadingIndicator from '@components/FullscreenLoadingIndicator';

import useOnyx from '@hooks/useOnyx';

import VerifyAccountPageBase from '@pages/settings/VerifyAccountPageBase';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Route} from '@src/ROUTES';
import ROUTES from '@src/ROUTES';

import type {ReactNode} from 'react';

import {isUserValidatedSelector} from '@selectors/Account';
import React from 'react';

type DelegateRoleAccountValidationProps = {
    children: ReactNode;
    /** The requested page, retained if verification finishes before this guard receives the account update. */
    navigateForwardTo: Route;
};

function DelegateRoleAccountValidation({children, navigateForwardTo}: DelegateRoleAccountValidationProps) {
    const [isUserValidated] = useOnyx(ONYXKEYS.ACCOUNT, {selector: isUserValidatedSelector});

    if (isUserValidated === undefined) {
        return <FullscreenLoadingIndicator shouldUseGoBackButton />;
    }

    return (
        <DelegateNoAccessWrapper accessDeniedVariants={[CONST.DELEGATE.DENIED_ACCESS_VARIANTS.DELEGATE]}>
            {isUserValidated ? (
                children
            ) : (
                <VerifyAccountPageBase
                    navigateBackTo={ROUTES.SETTINGS_COPILOT}
                    navigateForwardTo={navigateForwardTo}
                />
            )}
        </DelegateNoAccessWrapper>
    );
}

export default DelegateRoleAccountValidation;
