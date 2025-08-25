import {useEffect, useState} from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import {usePersonalDetails} from '@components/OnyxListItemProvider';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import CONST from '@src/CONST';
import type {Policy} from '@src/types/onyx';

const useShouldShowChangeOwnerPage = (policy: OnyxEntry<Policy>, accountID: number) => {
    const personalDetails = usePersonalDetails();
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    const [shouldShow, setShouldShow] = useState(false);

    useEffect(() => {
        const isCurrentUserOwner = policy?.owner === currentUserPersonalDetails?.login;
        const isCurrentUserAdmin = policy?.employeeList?.[personalDetails?.[currentUserPersonalDetails?.accountID]?.login ?? '']?.role === CONST.POLICY.ROLE.ADMIN;
        const isAccountOwner = policy?.owner === personalDetails?.[accountID]?.login;
        const isSuccessOrFailed = (!policy?.errorFields && !!policy?.isChangeOwnerFailed) || (!policy?.errorFields?.changeOwner && !!policy?.isChangeOwnerSuccessful);
        setShouldShow((!isCurrentUserOwner && isCurrentUserAdmin && isAccountOwner) || isSuccessOrFailed);
    }, [
        accountID,
        currentUserPersonalDetails?.accountID,
        currentUserPersonalDetails?.login,
        personalDetails,
        policy?.employeeList,
        policy?.errorFields,
        policy?.isChangeOwnerFailed,
        policy?.isChangeOwnerSuccessful,
        policy?.owner,
    ]);

    return shouldShow;
};

export default useShouldShowChangeOwnerPage;
