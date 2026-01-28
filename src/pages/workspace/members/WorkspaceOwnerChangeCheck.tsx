import React, {useCallback, useEffect, useState} from 'react';
import {View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import type {ValueOf} from 'type-fest';
import Button from '@components/Button';
import {usePersonalDetails} from '@components/OnyxListItemProvider';
import Text from '@components/Text';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import {clearWorkspaceOwnerChangeFlow, requestWorkspaceOwnerChange} from '@libs/actions/Policy/Member';
import {getOwnershipChecksDisplayText} from '@libs/WorkspacesSettingsUtils';
import Navigation from '@navigation/Navigation';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type * as OnyxTypes from '@src/types/onyx';

type WorkspaceOwnerChangeCheckProps = {
    /** The policy */
    policy: OnyxEntry<OnyxTypes.Policy>;

    /** The accountID */
    accountID: number;

    /** The error code */
    error: ValueOf<typeof CONST.POLICY.OWNERSHIP_ERRORS>;
};

function WorkspaceOwnerChangeCheck({policy, accountID, error}: WorkspaceOwnerChangeCheckProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    const [displayTexts, setDisplayTexts] = useState({
        title: '',
        text: '',
        buttonText: '',
    });
    const personalDetails = usePersonalDetails();
    const userPersonalDetails = personalDetails?.[accountID];

    const policyID = policy?.id;

    const updateDisplayTexts = useCallback(() => {
        const changeOwnerErrors = Object.keys(policy?.errorFields?.changeOwner ?? {});
        if (error !== changeOwnerErrors.at(0)) {
            return;
        }

        const texts = getOwnershipChecksDisplayText(error, translate, policy, userPersonalDetails?.login);
        setDisplayTexts(texts);
    }, [error, userPersonalDetails?.login, policy, translate]);

    useEffect(() => {
        updateDisplayTexts();
    }, [updateDisplayTexts]);

    const confirm = useCallback(() => {
        if (!policyID) {
            return;
        }
        if (error === CONST.POLICY.OWNERSHIP_ERRORS.HAS_FAILED_SETTLEMENTS || error === CONST.POLICY.OWNERSHIP_ERRORS.FAILED_TO_CLEAR_BALANCE) {
            // cannot transfer ownership if there are failed settlements, or we cannot clear the balance
            clearWorkspaceOwnerChangeFlow(policyID);
            Navigation.goBack();
            Navigation.navigate(ROUTES.WORKSPACE_MEMBER_DETAILS.getRoute(policyID, accountID));
            return;
        }

        requestWorkspaceOwnerChange(policyID, currentUserPersonalDetails.accountID, currentUserPersonalDetails.login ?? '');
    }, [accountID, error, policyID, currentUserPersonalDetails.accountID, currentUserPersonalDetails.login]);

    return (
        <>
            <Text style={[styles.textHeadline, styles.mt3, styles.mb2]}>{displayTexts.title}</Text>
            <Text style={styles.flex1}>{displayTexts.text}</Text>
            <View style={styles.pb5}>
                <Button
                    success
                    large
                    onPress={confirm}
                    text={displayTexts.buttonText}
                />
            </View>
        </>
    );
}

export default WorkspaceOwnerChangeCheck;
