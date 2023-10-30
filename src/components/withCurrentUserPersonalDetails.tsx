import React, {ComponentType, ForwardedRef, RefAttributes, useMemo} from 'react';
import {OnyxEntry, withOnyx} from 'react-native-onyx';
import getComponentDisplayName from '@libs/getComponentDisplayName';
import personalDetailsPropType from '@pages/personalDetailsPropType';
import ONYXKEYS from '@src/ONYXKEYS';
import type {PersonalDetails, PersonalDetailsList, Session} from '@src/types/onyx';

type CurrentUserPersonalDetails = PersonalDetails | Record<string, never>;

type OnyxProps = {
    /** Personal details of all the users, including current user */
    personalDetails: OnyxEntry<PersonalDetailsList>;

    /** Session of the current user */
    session: OnyxEntry<Session>;
};

type HOCProps = {
    currentUserPersonalDetails: CurrentUserPersonalDetails;
};

type ComponentProps = OnyxProps & HOCProps;

// TODO: remove when all components that use it will be migrated to TS
const withCurrentUserPersonalDetailsPropTypes = {
    currentUserPersonalDetails: personalDetailsPropType,
};

const withCurrentUserPersonalDetailsDefaultProps: HOCProps = {
    currentUserPersonalDetails: {},
};

export default function <TProps extends ComponentProps, TRef>(
    WrappedComponent: ComponentType<TProps & RefAttributes<TRef>>,
): ComponentType<Omit<Omit<TProps, keyof HOCProps> & RefAttributes<TRef>, keyof OnyxProps>> {
    function WithCurrentUserPersonalDetails(props: Omit<TProps, keyof HOCProps>, ref: ForwardedRef<TRef>) {
        const accountID = props.session?.accountID ?? 0;
        const accountPersonalDetails = props.personalDetails?.[accountID];
        const currentUserPersonalDetails: CurrentUserPersonalDetails = useMemo(
            () => (accountPersonalDetails ? {...accountPersonalDetails, accountID} : {}) as CurrentUserPersonalDetails,
            [accountPersonalDetails, accountID],
        );
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

    const withCurrentUserPersonalDetails = React.forwardRef(WithCurrentUserPersonalDetails);

    return withOnyx<Omit<TProps, keyof HOCProps> & RefAttributes<TRef>, OnyxProps>({
        personalDetails: {
            key: ONYXKEYS.PERSONAL_DETAILS_LIST,
        },
        session: {
            key: ONYXKEYS.SESSION,
        },
    })(withCurrentUserPersonalDetails);
}

export {withCurrentUserPersonalDetailsPropTypes, withCurrentUserPersonalDetailsDefaultProps};
