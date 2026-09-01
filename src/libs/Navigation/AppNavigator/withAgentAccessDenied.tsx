import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';

import useIsAgentAccount from '@hooks/useIsAgentAccount';

import Navigation from '@libs/Navigation/Navigation';

import ROUTES from '@src/ROUTES';

import {useFocusEffect, useIsFocused} from '@react-navigation/native';
import React, {useCallback, useEffect} from 'react';

function withAgentAccessDenied(getComponent: () => React.ComponentType): () => React.ComponentType {
    let ProtectedComponent: React.ComponentType | undefined;
    return () => {
        if (!ProtectedComponent) {
            const Component = getComponent();
            ProtectedComponent = (props) => {
                const isAgent = useIsAgentAccount();
                const isFocused = useIsFocused();
                const isAlreadyOnRedirectTarget = Navigation.isActiveRoute(ROUTES.SETTINGS_PROFILE.route);
                const shouldRedirect = isAgent === true && !isAlreadyOnRedirectTarget;

                const redirectAgentAway = useCallback(() => {
                    if (isAgent !== true) {
                        return;
                    }

                    // On a cold deep-link the effect can run before the NavigationContainer is ready, so the
                    // redirect is silently dropped and leaves a blank central pane. Wait for readiness before
                    // reading navigation state or dispatching.
                    Navigation.isNavigationReady().then(() => {
                        if (Navigation.isActiveRoute(ROUTES.SETTINGS_PROFILE.route)) {
                            return;
                        }

                        // forceReplace REPLACEs the stale guarded central-pane route instead of PUSHing Profile on
                        // top of it, so back from Profile pops to the unguarded Account sidebar rather than the
                        // guarded route that would re-fire this redirect.
                        const redirectToProfile = () => Navigation.navigate(ROUTES.SETTINGS_PROFILE.getRoute(), {forceReplace: true});

                        // The guarded screen can be open inside a modal/RHP (e.g. the agent-edit page the owner was
                        // on when they tapped "Copilot into account"), or an unguarded RHP (e.g. the agent DM) can be
                        // sitting on top of this guarded central pane. Navigating straight to the tab-nested Profile
                        // route while an RHP is focused gets forced to PUSH (see linkTo), stacking Profile on top of
                        // the still-guarded route and trapping the user in a Profile <-> Profile loop on back. Dismiss
                        // the modal first, then redirect once it's closed (the underlying pane may be unguarded, so we
                        // can't rely on its guard to redirect).
                        if (Navigation.isTopmostRouteModalScreen()) {
                            Navigation.dismissModal({afterTransition: redirectToProfile});
                            return;
                        }

                        redirectToProfile();
                    });
                }, [isAgent]);

                // Redirect on every focus (not just the initial transition from false to true) so navigating back
                // onto a guarded screen that the split navigator keeps mounted (e.g. a stale agents route
                // left over from the owner session) bounces the agent to a page they can access instead of
                // rendering a blank pane.
                useFocusEffect(redirectAgentAway);

                // useFocusEffect only fires while this screen is focused. When the session flips to an agent while
                // this guarded screen is mounted but NOT focused, for example the owner taps "Copilot into account" from
                // an unguarded RHP (the agent DM) sitting over this guarded central pane, useFocusEffect never runs,
                // so the pane renders null (blank background) until the RHP is closed. Drive the redirect off the
                // isAgent transition here too so the background is corrected immediately. Skip when focused since
                // useFocusEffect already covers that case.
                useEffect(() => {
                    if (isFocused) {
                        return;
                    }
                    redirectAgentAway();
                }, [isFocused, redirectAgentAway]);

                if (isAgent === undefined || shouldRedirect) {
                    return null;
                }
                if (isAgent === true) {
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
