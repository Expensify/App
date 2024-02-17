import type {StackScreenProps} from '@react-navigation/stack';
import React, {useMemo} from 'react';
import {type OnyxCollection, withOnyx} from 'react-native-onyx';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import SelectionList from '@components/SelectionList';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import {updateRoomDraftWorkspace} from '@libs/actions/Report';
import Navigation from '@libs/Navigation/Navigation';
import {NewChatNavigatorParamList} from '@libs/Navigation/types';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
// import * as PolicyUtils from '@libs/PolicyUtils';
import type SCREENS from '@src/SCREENS';
import type {NewRoomDraft as NewRoomDraftType, Policy as PolicyType} from '@src/types/onyx';

// import newRoomDraftPropTypes from './newRoomDraftPropTypes';

// const propTypes = {
//     /** The list of policies the user has access to. */
//     policies: PropTypes.objectOf(
//         PropTypes.shape({
//             /** The policy type */
//             type: PropTypes.oneOf(_.values(CONST.POLICY.TYPE)),

//             /** The name of the policy */
//             name: PropTypes.string,

//             /** The ID of the policy */
//             id: PropTypes.string,
//         }),
//     ),

//     /** Form state for NEW_ROOM_FORM */
//     formState: PropTypes.shape({
//         /** Loading state for the form */
//         isLoading: PropTypes.bool,

//         /** Field errors in the form */
//         errorFields: PropTypes.objectOf(PropTypes.objectOf(PropTypes.string)),
//     }),

//     /** policyID for main workspace */
//     activePolicyID: PropTypes.string,

//     /** New room draft data */
//     newRoomDraft: newRoomDraftPropTypes,
// };

// const defaultProps = {
//     policies: {},
//     formState: {
//         isLoading: false,
//         errorFields: {},
//     },
//     activePolicyID: null,
//     newRoomDraft: {},
// };

type NewRoomWorkspaceSelectorOnyxProps = {
    /** The list of this user's policies */
    policies: OnyxCollection<PolicyType>;

    newRoomDraft: OnyxCollection<NewRoomDraftType>;
};

type NewRoomWorkspaceSelectorPageProps = NewRoomWorkspaceSelectorOnyxProps & StackScreenProps<NewChatNavigatorParamList, typeof SCREENS.NEW_CHAT.NEW_ROOM_WORKSPACE_SELECTOR>;

function NewRoomWorkspaceSelector({policies, route, newRoomDraft}: NewRoomWorkspaceSelectorPageProps) {
    const {translate} = useLocalize();

    console.log(newRoomDraft, policies);
    const styles = useThemeStyles();

    const workspaceOptions = useMemo(() => {
        if (!policies) {
            return [];
        }
        return Object.values(policies)
            .filter((policy): policy is PolicyType => policy?.type !== CONST.POLICY.TYPE.PERSONAL)
            .map((policy) => ({
                value: {name: policy?.name, id: policy?.id},
                keyForList: policy?.id,
                text: policy?.name,
                // isSelected: newRoomDraft && newRoomDraft === policy.id,
            }));
    }, [policies]);

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
                onSelectRow={setPolicyID}
                // initiallyFocusedOptionKey={new}
                // shouldStopPropagation
                // initiallyFocusedOptionKey={selectedItem.value}
                // shouldShowTooltips={shouldShowTooltips}
            />
        </ScreenWrapper>
    );
}

// NewRoomWorkspaceSelector.propTypes = propTypes;
// NewRoomWorkspaceSelector.defaultProps = defaultProps;
NewRoomWorkspaceSelector.displayName = 'NewRoomWorkspaceSelector';

export default withOnyx<NewRoomWorkspaceSelectorPageProps, NewRoomWorkspaceSelectorOnyxProps>({
    policies: {
        key: ONYXKEYS.COLLECTION.POLICY,
    },
    newRoomDraft: {
        key: ONYXKEYS.COLLECTION.NEW_ROOM_DRAFT,
    },
})(NewRoomWorkspaceSelector);
