import type {ComponentType} from 'react';
import React from 'react';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import getComponentDisplayName from '@libs/getComponentDisplayName';
import type {CurrentUserPersonalDetails} from '@src/types/onyx/PersonalDetails';

type HOCProps = {
    currentUserPersonalDetails: CurrentUserPersonalDetails;
};

type WithCurrentUserPersonalDetailsProps = HOCProps;

export default function <TProps extends WithCurrentUserPersonalDetailsProps>(WrappedComponent: ComponentType<TProps>): ComponentType<Omit<TProps, keyof HOCProps>> {
    function WithCurrentUserPersonalDetails(props: Omit<TProps, keyof HOCProps>) {
        const currentUserPersonalDetails = useCurrentUserPersonalDetails();
        return (
            <WrappedComponent
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...(props as TProps)}
                currentUserPersonalDetails={currentUserPersonalDetails}
            />
        );
    }

    WithCurrentUserPersonalDetails.displayName = `WithCurrentUserPersonalDetails(${getComponentDisplayName(WrappedComponent)})`;

    return WithCurrentUserPersonalDetails;
}

export type {WithCurrentUserPersonalDetailsProps};
