import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';

import useOnyx from '@hooks/useOnyx';

import Navigation from '@libs/Navigation/Navigation';
import {isAgentEmail} from '@libs/SessionUtils';

import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {Session} from '@src/types/onyx';

import {useFocusEffect} from '@react-navigation/native';
import React, {useCallback} from 'react';

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

                        // forceReplace REPLACEs the stale guarded central-pane route instead of PUSHing Profile on
                        // top of it, so back from Profile pops to the unguarded Account sidebar rather than the
                        // guarded route that would re-fire this redirect.
                        const redirectToProfile = () => Navigation.navigate(ROUTES.SETTINGS_PROFILE.getRoute(), {forceReplace: true});

                        // The guarded screen can be open inside a modal/RHP (e.g. the agent-edit page the owner was
                        // on when they tapped "Copilot into account"). Navigating straight to the tab-nested Profile
                        // route while an RHP is focused gets forced to PUSH (see linkTo), stacking Profile on top of
                        // the still-guarded route and trapping the user in a Profile <-> Profile loop on back. Dismiss
                        // the modal first, then redirect once it's closed (the underlying pane may be unguarded, so we
                        // can't rely on its guard to redirect).
                        if (Navigation.isTopmostRouteModalScreen()) {
                            Navigation.dismissModal({afterTransition: redirectToProfile});
                            return;
                        }

                        redirectToProfile();
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
