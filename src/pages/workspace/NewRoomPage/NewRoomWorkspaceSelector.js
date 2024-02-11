import PropTypes from 'prop-types';
import React, {useEffect, useMemo, useState} from 'react';
import {withOnyx} from 'react-native-onyx';
import _ from 'underscore';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import SelectionList from '@components/SelectionList';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import {updateRoomDraftWorkspace} from '@libs/actions/Report';
import Navigation from '@libs/Navigation/Navigation';
import * as PolicyUtils from '@libs/PolicyUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import newRoomDraftPropTypes from './newRoomDraftPropTypes';

const propTypes = {
    /** The list of policies the user has access to. */
    policies: PropTypes.objectOf(
        PropTypes.shape({
            /** The policy type */
            type: PropTypes.oneOf(_.values(CONST.POLICY.TYPE)),

            /** The name of the policy */
            name: PropTypes.string,

            /** The ID of the policy */
            id: PropTypes.string,
        }),
    ),

    /** Form state for NEW_ROOM_FORM */
    formState: PropTypes.shape({
        /** Loading state for the form */
        isLoading: PropTypes.bool,

        /** Field errors in the form */
        errorFields: PropTypes.objectOf(PropTypes.objectOf(PropTypes.string)),
    }),

    /** policyID for main workspace */
    activePolicyID: PropTypes.string,

    /** New room draft data */
    newRoomDraft: newRoomDraftPropTypes,
};

const defaultProps = {
    policies: {},
    formState: {
        isLoading: false,
        errorFields: {},
    },
    activePolicyID: null,
    newRoomDraft: {},
};

function NewRoomWorkspaceSelector(props) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();

    const workspaceOptions = useMemo(
        () =>
            _.map(
                _.filter(PolicyUtils.getActivePolicies(props.policies), (policy) => policy.type !== CONST.POLICY.TYPE.PERSONAL),
                (policy) => ({
                    value: {name: policy.name, id: policy.id},
                    keyForList: policy.id,
                    text: policy.name,
                    isSelected: props.activePolicyID === policy.id,
                }),
            ),
        [props.policies, props.activePolicyID],
    );

    const setPolicyID = (value) => {
        const {id, name} = value.value;
        updateRoomDraftWorkspace(id, name);
    };

    return (
        <ScreenWrapper
            style={[styles.pb0]}
            includePaddingTop={false}
            includeSafeAreaPaddingBottom={false}
            testID={NewRoomWorkspaceSelector.displayName}
        >
            <HeaderWithBackButton
                title={translate('workspace.common.workspace')}
                onBackButtonPress={Navigation.goBack}
            />
            <SelectionList
                sections={[{data: workspaceOptions}]}
                value={props.activePolicyID}
                onSelectRow={setPolicyID}
                initiallyFocusedOptionKey={props.activePolicyID}
                // shouldStopPropagation
                // initiallyFocusedOptionKey={selectedItem.value}
                // shouldShowTooltips={shouldShowTooltips}
            />
        </ScreenWrapper>
    );
}

NewRoomWorkspaceSelector.propTypes = propTypes;
NewRoomWorkspaceSelector.defaultProps = defaultProps;
NewRoomWorkspaceSelector.displayName = 'NewRoomWorkspaceSelector';

export default withOnyx({
    policies: {
        key: ONYXKEYS.COLLECTION.POLICY,
    },
    formState: {
        key: ONYXKEYS.FORMS.NEW_ROOM_FORM,
    },
    activePolicyID: {
        key: ONYXKEYS.ACCOUNT,
        selector: (account) => (account && account.activePolicyID) || null,
        initialValue: null,
    },
    newRoomDraft: {
        key: ONYXKEYS.COLLECTION.NEW_ROOM_DRAFT,
    },
})(NewRoomWorkspaceSelector);
