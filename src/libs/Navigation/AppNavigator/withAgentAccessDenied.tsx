import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';

import useOnyx from '@hooks/useOnyx';

import Navigation from '@libs/Navigation/Navigation';
import {isAgentEmail} from '@libs/SessionUtils';

import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {Session} from '@src/types/onyx';

import React, {useEffect} from 'react';

const sessionEmailSelector = (session: Session | undefined) => session?.email;

function withAgentAccessDenied(getComponent: () => React.ComponentType): () => React.ComponentType {
    let ProtectedComponent: React.ComponentType | undefined;
    return () => {
        if (!ProtectedComponent) {
            const Component = getComponent();
            ProtectedComponent = (props) => {
                const [sessionEmail] = useOnyx(ONYXKEYS.SESSION, {selector: sessionEmailSelector});
                const isAgent = isAgentEmail(sessionEmail);
                const isAlreadyOnRedirectTarget = Navigation.isActiveRoute(ROUTES.SETTINGS_PROFILE.route);
                const shouldRedirect = isAgent && !isAlreadyOnRedirectTarget;

                useEffect(() => {
                    if (!shouldRedirect) {
                        return;
                    }
                    Navigation.navigate(ROUTES.SETTINGS_PROFILE.getRoute());
                }, [shouldRedirect]);

                if (shouldRedirect) {
                    return null;
                }
                if (isAgent) {
                    return (
                        <FullPageNotFoundView
                            shouldShow
                            titleKey="delegate.notAllowed"
                            subtitleKey="delegate.noAccessMessage"
                            shouldShowLink={false}
                        />
                    );
                }
                return <Component {...props} />;
            };
        }
        return ProtectedComponent;
    };
}

export default withAgentAccessDenied;
