import type {ComponentType, ForwardedRef, RefAttributes} from 'react';
import React from 'react';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import getComponentDisplayName from '@libs/getComponentDisplayName';
import personalDetailsPropType from '@pages/personalDetailsPropType';
import type {PersonalDetails} from '@src/types/onyx';

type CurrentUserPersonalDetails = PersonalDetails | Record<string, never>;

type HOCProps = {
    currentUserPersonalDetails: CurrentUserPersonalDetails;
};

type WithCurrentUserPersonalDetailsProps = HOCProps;

// TODO: remove when all components that use it will be migrated to TS
const withCurrentUserPersonalDetailsPropTypes = {
    currentUserPersonalDetails: personalDetailsPropType,
};

const withCurrentUserPersonalDetailsDefaultProps: HOCProps = {
    currentUserPersonalDetails: {},
};

export default function <TProps extends WithCurrentUserPersonalDetailsProps, TRef>(
    WrappedComponent: ComponentType<TProps & RefAttributes<TRef>>,
): ComponentType<Omit<TProps, keyof HOCProps> & RefAttributes<TRef>> {
    function WithCurrentUserPersonalDetails(props: Omit<TProps, keyof HOCProps>, ref: ForwardedRef<TRef>) {
        const currentUserPersonalDetails = useCurrentUserPersonalDetails();
        return (
            <WrappedComponent
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...(props as TProps)}
                ref={ref}
                currentUserPersonalDetails={currentUserPersonalDetails}
            />
        );
    }

    WithCurrentUserPersonalDetails.displayName = `WithCurrentUserPersonalDetails(${getComponentDisplayName(WrappedComponent)})`;

    return React.forwardRef(WithCurrentUserPersonalDetails);
}

export {withCurrentUserPersonalDetailsPropTypes, withCurrentUserPersonalDetailsDefaultProps};
export type {WithCurrentUserPersonalDetailsProps, CurrentUserPersonalDetails};
