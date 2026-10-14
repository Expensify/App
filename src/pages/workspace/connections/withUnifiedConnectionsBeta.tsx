import useIsUnifiedConnectionsBetaEnabled from '@hooks/useIsUnifiedConnectionsBetaEnabled';

import type {ComponentProps, ComponentType} from 'react';

import React from 'react';

import WorkspaceConnectionsPage from './WorkspaceConnectionsPage';

type WorkspaceConnectionsPageProps = ComponentProps<typeof WorkspaceConnectionsPage>;

/**
 * Renders the Connections page in place of a page it replaces while the unified Connections beta is on. Old links and
 * deep links into those pages' settings still resolve to their routes, so they need to land on Connections for beta users.
 */
export default function withUnifiedConnectionsBeta<TProps extends Record<string, unknown>>(WrappedComponent: ComponentType<TProps>): ComponentType<TProps> {
    function WithUnifiedConnectionsBeta(props: TProps) {
        const isUnifiedConnectionsBetaEnabled = useIsUnifiedConnectionsBetaEnabled();

        if (isUnifiedConnectionsBetaEnabled) {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- these are the screen props of a page Connections replaced, and it only reads the policy ID and the connection to start from the route
            return <WorkspaceConnectionsPage {...(props as unknown as WorkspaceConnectionsPageProps)} />;
        }

        return <WrappedComponent {...props} />;
    }

    return WithUnifiedConnectionsBeta;
}
