import PropTypes from 'prop-types';
import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import _ from 'underscore';
import HeaderPageLayout from '@components/HeaderPageLayout';
import * as Expensicons from '@components/Icon/Expensicons';
import OptionRow from '@components/OptionRow';
import OptionsSelector from '@components/OptionsSelector';
import Text from '@components/Text';
import useAutoFocusInput from '@hooks/useAutoFocusInput';
import useNetwork from '@hooks/useNetwork';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import * as PolicyUtils from '@libs/PolicyUtils';
import * as ReportUtils from '@libs/ReportUtils';
import * as Policy from '@userActions/Policy';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import SCREENS from '@src/SCREENS';

const propTypes = {
    /** The list of this user's policies */
    policies: PropTypes.objectOf(
        PropTypes.shape({
            /** The ID of the policy */
            id: PropTypes.string,

            /** The name of the policy */
            name: PropTypes.string,

            /** The type of the policy */
            type: PropTypes.string,

            /** The user's role in the policy */
            role: PropTypes.string,

            /** The current action that is waiting to happen on the policy */
            pendingAction: PropTypes.oneOf(_.values(CONST.RED_BRICK_ROAD_PENDING_ACTION)),
        }),
    ),
    activeWorkspaceID: PropTypes.arrayOf([PropTypes.undefined, PropTypes.string]),
};

const defaultProps = {
    policies: {},
    activeWorkspaceID: undefined,
};

function WorkspaceSwitcherPage({policies, activeWorkspaceID}) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const {isOffline} = useNetwork();
    const [selectedOption, setSelectedOption] = useState();
    const [searchTerm, setSearchTerm] = useState('');

    const getIndicatorTypeForPolicy = useCallback(
        // TO DO: Wait for missing logic to be implemented in other PR
        // CONST.BRICK_ROAD_INDICATOR_STATUS.INFO or CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR
        // eslint-disable-next-line no-unused-vars
        (policyId) => undefined,
        [],
    );

    const hasUnreadData = useCallback(
        // TO DO: Implement checking if policy has some unread data
        // eslint-disable-next-line no-unused-vars
        (policyId) => false,
        [],
    );

    const selectPolicy = useCallback((option) => {
        const policyID = option.policyID;
        Policy.selectWorkspace(policyID);

        if (policyID) {
            setSelectedOption(option);
        } else {
            setSelectedOption(undefined);
        }
    }, []);

    const onChangeText = useCallback((newSearchTerm) => {
        // TO DO: Handle searching logic
        setSearchTerm(newSearchTerm);
    }, []);

    const usersWorkspaces = useMemo(
        () =>
            _.chain(policies)
                .filter((policy) => PolicyUtils.shouldShowPolicy(policy, isOffline))
                .map((policy) => ({
                    text: policy.name,
                    policyID: policy.id,
                    brickRoadIndicator: getIndicatorTypeForPolicy(policy.id),
                    icons: [
                        {
                            source: policy.avatar ? policy.avatar : ReportUtils.getDefaultWorkspaceAvatar(policy.name),
                            fallbackIcon: Expensicons.FallbackWorkspaceAvatar,
                            name: policy.name,
                            type: CONST.ICON_TYPE_WORKSPACE,
                        },
                    ],
                    boldStyle: hasUnreadData(policy.id),
                }))
                .sortBy((policy) => policy.text.toLowerCase())
                .value(),
        [policies, isOffline, getIndicatorTypeForPolicy, hasUnreadData],
    );

    const usersWorkspacesSectionData = useMemo(
        () => ({
            data: usersWorkspaces,
            shouldShow: true,
            indexOffset: 0,
        }),
        [usersWorkspaces],
    );

    const everythingSection = useMemo(() => {
        const option = {
            text: 'Expensify',
            icons: [
                {
                    source: Expensicons.ExpensifyAppIcon,
                    name: 'Expensify',
                    type: CONST.ICON_TYPE_AVATAR,
                },
            ],
            brickRoadIndicator: getIndicatorTypeForPolicy(undefined),
            boldStyle: hasUnreadData(undefined),
        };

        return (
            <>
                <View style={[styles.mh4, styles.flexRow, styles.justifyContentBetween, styles.alignItemsCenter, styles.mb3]}>
                    <Text
                        style={styles.label}
                        color={theme.textSupporting}
                    >
                        Everything
                    </Text>
                </View>
                <View>
                    <OptionRow
                        option={{...option, brickRoadIndicator: option.policyID === activeWorkspaceID ? undefined : option.brickRoadIndicator}}
                        onSelectRow={selectPolicy}
                        showTitleTooltip={false}
                        shouldShowSubscript={false}
                        highlightSelected
                        isSelected={option.policyID === activeWorkspaceID}
                    />
                </View>
            </>
        );
    }, [
        activeWorkspaceID,
        getIndicatorTypeForPolicy,
        hasUnreadData,
        selectPolicy,
        styles.alignItemsCenter,
        styles.flexRow,
        styles.justifyContentBetween,
        styles.label,
        styles.mb3,
        styles.mh4,
        theme.textSupporting,
    ]);

    const inputCallbackRef = useAutoFocusInput();
    const workspacesSection = useMemo(
        () => (
            <>
                <View style={[styles.mh4, styles.flexRow, styles.justifyContentBetween, styles.alignItemsCenter, styles.mb1]}>
                    <Text
                        style={[styles.mt3, styles.label]}
                        color={theme.textSupporting}
                    >
                        Workspaces
                    </Text>
                </View>
                {/* TO DO: Display breadcrumb */}
                {usersWorkspacesSectionData.data.length === 0 && <View />}
                <OptionsSelector
                    ref={inputCallbackRef}
                    sections={[usersWorkspacesSectionData]}
                    value={searchTerm}
                    shouldShowTextInput={usersWorkspacesSectionData.data.length > 8}
                    onChangeText={onChangeText}
                    selectedOptions={selectedOption ? [selectedOption] : []}
                    onSelectRow={selectPolicy}
                    boldStyle
                    shouldPreventDefaultFocusOnSelectRow
                    highlightSelectedOptions
                    shouldShowOptions
                    autoFocus={false}
                    disableFocusOptions
                    canSelectMultipleOptions={false}
                    shouldShowSubscript={false}
                    showTitleTooltip={false}
                    contentContainerStyles={[styles.pt0, styles.mt0]}
                />
            </>
        ),
        [
            inputCallbackRef,
            onChangeText,
            searchTerm,
            selectPolicy,
            selectedOption,
            styles.alignItemsCenter,
            styles.flexRow,
            styles.justifyContentBetween,
            styles.label,
            styles.mb1,
            styles.mh4,
            styles.mt0,
            styles.mt3,
            styles.pt0,
            theme.textSupporting,
            usersWorkspacesSectionData,
        ],
    );

    useEffect(() => {
        if (!activeWorkspaceID) {
            return;
        }
        const optionToSet = _.find(usersWorkspaces, (option) => option.policyID === activeWorkspaceID);
        setSelectedOption(optionToSet);
    }, [activeWorkspaceID, usersWorkspaces]);

    return (
        <HeaderPageLayout
            title="Choose a workspace"
            backgroundColor={theme.PAGE_THEMES[SCREENS.WORKSPACE_SWITCHER.ROOT].backgroundColor}
        >
            {everythingSection}
            {workspacesSection}
        </HeaderPageLayout>
    );
}

WorkspaceSwitcherPage.propTypes = propTypes;
WorkspaceSwitcherPage.defaultProps = defaultProps;
WorkspaceSwitcherPage.displayName = 'WorkspaceSwitcherPage';

export default withOnyx({
    policies: {
        key: ONYXKEYS.COLLECTION.POLICY,
    },
    activeWorkspaceID: {
        key: ONYXKEYS.ACTIVE_WORKSPACE_ID,
    },
})(WorkspaceSwitcherPage);
