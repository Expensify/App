import React, {ComponentType, ForwardedRef, RefAttributes, useMemo} from 'react';
import {OnyxEntry, withOnyx} from 'react-native-onyx';
import getComponentDisplayName from '@libs/getComponentDisplayName';
import personalDetailsPropType from '@pages/personalDetailsPropType';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {PersonalDetails, Session} from '@src/types/onyx';
import {usePersonalDetails} from './OnyxProvider';

type CurrentUserPersonalDetails = PersonalDetails | Record<string, never>;

type OnyxProps = {
    /** Session of the current user */
    session: OnyxEntry<Session>;
};

type HOCProps = {
    currentUserPersonalDetails: CurrentUserPersonalDetails;
};

type WithCurrentUserPersonalDetailsProps = OnyxProps & HOCProps;

// TODO: remove when all components that use it will be migrated to TS
const withCurrentUserPersonalDetailsPropTypes = {
    currentUserPersonalDetails: personalDetailsPropType,
};

const withCurrentUserPersonalDetailsDefaultProps: HOCProps = {
    currentUserPersonalDetails: {},
};

export default function <TProps extends WithCurrentUserPersonalDetailsProps, TRef>(
    WrappedComponent: ComponentType<TProps & RefAttributes<TRef>>,
): ComponentType<Omit<Omit<TProps, keyof HOCProps> & RefAttributes<TRef>, keyof OnyxProps>> {
    function WithCurrentUserPersonalDetails(props: Omit<TProps, keyof HOCProps>, ref: ForwardedRef<TRef>) {
        const personalDetails = usePersonalDetails() ?? CONST.EMPTY_OBJECT;
        const accountID = props.session?.accountID ?? 0;
        const accountPersonalDetails = personalDetails?.[accountID];
        const currentUserPersonalDetails: CurrentUserPersonalDetails = useMemo(
            () => (accountPersonalDetails ? {...accountPersonalDetails, accountID} : {}),
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
        session: {
            key: ONYXKEYS.SESSION,
        },
    })(withCurrentUserPersonalDetails);
}

export {withCurrentUserPersonalDetailsPropTypes, withCurrentUserPersonalDetailsDefaultProps};
export type {WithCurrentUserPersonalDetailsProps};
