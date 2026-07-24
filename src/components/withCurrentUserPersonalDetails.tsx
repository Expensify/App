import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';

import getComponentDisplayName from '@libs/getComponentDisplayName';

import type {CurrentUserPersonalDetails} from '@src/types/onyx/PersonalDetails';

import type {ComponentType} from 'react';

import React from 'react';

type HOCProps = {
    currentUserPersonalDetails: CurrentUserPersonalDetails;
};

type WithCurrentUserPersonalDetailsProps = HOCProps;

type WithCurrentUserPersonalDetailsImplProps<TProps extends WithCurrentUserPersonalDetailsProps> = {
    WrappedComponent: ComponentType<TProps>;
} & Omit<TProps, keyof HOCProps>;

function WithCurrentUserPersonalDetailsImpl<TProps extends WithCurrentUserPersonalDetailsProps>({WrappedComponent, ...props}: WithCurrentUserPersonalDetailsImplProps<TProps>) {
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    return (
        <WrappedComponent
            {...(props as unknown as TProps)}
            currentUserPersonalDetails={currentUserPersonalDetails}
        />
    );
}

export default function <TProps extends WithCurrentUserPersonalDetailsProps>(WrappedComponent: ComponentType<TProps>): ComponentType<Omit<TProps, keyof HOCProps>> {
    function WithCurrentUserPersonalDetails(props: Omit<TProps, keyof HOCProps>) {
        return (
            <WithCurrentUserPersonalDetailsImpl
                WrappedComponent={WrappedComponent}
                {...props}
            />
        );
    }

    WithCurrentUserPersonalDetails.displayName = `WithCurrentUserPersonalDetails(${getComponentDisplayName(WrappedComponent)})`;

    return WithCurrentUserPersonalDetails;
}

export type {WithCurrentUserPersonalDetailsProps};
