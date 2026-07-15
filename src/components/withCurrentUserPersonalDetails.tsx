import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';

import getComponentDisplayName from '@libs/getComponentDisplayName';

import type {CurrentUserPersonalDetails} from '@src/types/onyx/PersonalDetails';

import type {ComponentType} from 'react';

import React from 'react';

type HOCProps = {
    currentUserPersonalDetails: CurrentUserPersonalDetails;
};

type WithCurrentUserPersonalDetailsProps = HOCProps;

export default function <TProps extends WithCurrentUserPersonalDetailsProps>(WrappedComponent: ComponentType<TProps>): ComponentType<Omit<TProps, keyof HOCProps>> {
    function WithCurrentUserPersonalDetails(props: Omit<TProps, keyof HOCProps>) {
        const currentUserPersonalDetails = useCurrentUserPersonalDetails();
        return (
            <WrappedComponent
                {...(props as TProps)}
                currentUserPersonalDetails={currentUserPersonalDetails}
            />
        );
    }

    WithCurrentUserPersonalDetails.displayName = `WithCurrentUserPersonalDetails(${getComponentDisplayName(WrappedComponent)})`;

    // OXC's React Compiler does not memoize this component on web, so memoize it explicitly to keep
    // parent-driven re-renders cheap on both platforms.
    return React.memo(WithCurrentUserPersonalDetails);
}

export type {WithCurrentUserPersonalDetailsProps};
