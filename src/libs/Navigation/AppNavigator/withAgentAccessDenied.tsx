import React, {useEffect} from 'react';
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

                useEffect(() => {
                    if (!isAgent) {
                        return;
                    }
                    Navigation.navigate(ROUTES.SETTINGS_PROFILE.getRoute());
                }, [isAgent]);

                if (isAgent) {
                    return null;
                }
                return <Component {...props} />;
            };
        }
        return ProtectedComponent;
    };
}

export default withAgentAccessDenied;
