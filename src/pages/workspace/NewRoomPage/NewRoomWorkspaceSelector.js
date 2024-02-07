import PropTypes from 'prop-types';
import {useMemo, useState} from 'react';
import {withOnyx} from 'react-native-onyx';
import _ from 'underscore';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import SelectionList from '@components/SelectionList';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import * as PolicyUtils from '@libs/PolicyUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

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
};

const defaultProps = {
    policies: {},
    formState: {
        isLoading: false,
        errorFields: {},
    },
    activePolicyID: null,
};

function NewRoomWorkspaceSelector(props) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();

    const workspaceOptions = useMemo(
        () =>
            _.map(
                _.filter(PolicyUtils.getActivePolicies(props.policies), (policy) => policy.type !== CONST.POLICY.TYPE.PERSONAL),
                (policy) => ({
                    label: policy.name,
                    key: policy.id,
                    value: policy.id,
                }),
            ),
        [props.policies],
    );

    const [policyID, setPolicyID] = useState(() => {
        if (_.some(workspaceOptions, (option) => option.value === props.activePolicyID)) {
            return props.activePolicyID;
        }
        return '';
    });

    return (
        <ScreenWrapper
            style={[styles.pb0]}
            includePaddingTop={false}
            includeSafeAreaPaddingBottom={false}
            testID="ValueSelectorModal"
        >
            <HeaderWithBackButton
                title={translate('workspace.common.workspace')}
                onBackButtonPress={() => {}}
            />
            <SelectionList
                sections={workspaceOptions}
                value={policyID}
                onSelectRow={setPolicyID}
                initiallyFocusedOptionKey={policyID}
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
})(NewRoomWorkspaceSelector);
