import {useFocusEffect} from '@react-navigation/native';
import React, {useCallback} from 'react';
import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
import useOnyx from '@hooks/useOnyx';
import Navigation from '@libs/Navigation/Navigation';
import {isAgentEmail} from '@libs/SessionUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {Session} from '@src/types/onyx';

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

                // Redirect on every focus (not just the initial false->true transition) so navigating back
                // onto a guarded screen that the split navigator keeps mounted (e.g. a stale agents route
                // left over from the owner session) bounces the agent to a page they can access instead of
                // rendering a blank pane.
                useFocusEffect(
                    useCallback(() => {
                        if (!isAgent || Navigation.isActiveRoute(ROUTES.SETTINGS_PROFILE.route)) {
                            return;
                        }
                        Navigation.navigate(ROUTES.SETTINGS_PROFILE.getRoute());
                    }, [isAgent]),
                );

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
