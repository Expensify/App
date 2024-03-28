import React, {useCallback, useEffect, useState} from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import {withOnyx} from 'react-native-onyx';
import type {ValueOf} from 'type-fest';
import Button from '@components/Button';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import * as WorkspaceSettingsUtils from '@libs/WorkspacesSettingsUtils';
import Navigation from '@navigation/Navigation';
import * as PolicyActions from '@userActions/Policy';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type * as OnyxTypes from '@src/types/onyx';

type WorkspaceOwnerChangeCheckOnyxProps = {
    /** Personal details of all users */
    personalDetails: OnyxEntry<OnyxTypes.PersonalDetailsList>;
};

type WorkspaceOwnerChangeCheckProps = WorkspaceOwnerChangeCheckOnyxProps & {
    /** The policy */
    policy: OnyxEntry<OnyxTypes.Policy>;

    /** The accountID */
    accountID: number;

    /** The error code */
    error: ValueOf<typeof CONST.POLICY.OWNERSHIP_ERRORS>;
};

function WorkspaceOwnerChangeCheck({personalDetails, policy, accountID, error}: WorkspaceOwnerChangeCheckProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const [displayTexts, setDisplayTexts] = useState({
        title: '',
        text: '',
        buttonText: '',
    });

    const policyID = policy?.id ?? '';

    const updateDisplayTexts = useCallback(() => {
        const changeOwnerErrors = Object.keys(policy?.errorFields?.changeOwner ?? {});
        if (error !== changeOwnerErrors[0]) {
            return;
        }

        const texts = WorkspaceSettingsUtils.getOwnershipChecksDisplayText(error, translate, policy, personalDetails?.[accountID]?.login);
        setDisplayTexts(texts);
    }, [accountID, error, personalDetails, policy, translate]);

    useEffect(() => {
        updateDisplayTexts();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        updateDisplayTexts();
    }, [updateDisplayTexts]);

    const confirm = useCallback(() => {
        if (error === CONST.POLICY.OWNERSHIP_ERRORS.HAS_FAILED_SETTLEMENTS || error === CONST.POLICY.OWNERSHIP_ERRORS.FAILED_TO_CLEAR_BALANCE) {
            // cannot transfer ownership if there are failed settlements, or we cannot clear the balance
            PolicyActions.clearWorkspaceOwnerChangeFlow(policyID);
            Navigation.navigate(ROUTES.WORKSPACE_MEMBER_DETAILS.getRoute(policyID, accountID));
            return;
        }

        PolicyActions.requestWorkspaceOwnerChange(policyID);
    }, [accountID, error, policyID]);

    return (
        <>
            <Text style={[styles.textHeadline, styles.mt3, styles.mb2]}>{displayTexts.title}</Text>
            <Text style={styles.flex1}>{displayTexts.text}</Text>
            <Button
                success
                large
                onPress={confirm}
                text={displayTexts.buttonText}
            />
        </>
    );
}

WorkspaceOwnerChangeCheck.displayName = 'WorkspaceOwnerChangeCheckPage';

export default withOnyx<WorkspaceOwnerChangeCheckProps, WorkspaceOwnerChangeCheckOnyxProps>({
    personalDetails: {
        key: ONYXKEYS.PERSONAL_DETAILS_LIST,
    },
})(WorkspaceOwnerChangeCheck);
