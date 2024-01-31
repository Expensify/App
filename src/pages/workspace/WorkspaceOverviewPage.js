import lodashGet from 'lodash/get';
import PropTypes from 'prop-types';
import React, {useCallback} from 'react';
import {View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import _ from 'underscore';
import Avatar from '@components/Avatar';
import AvatarWithImagePicker from '@components/AvatarWithImagePicker';
import * as Expensicons from '@components/Icon/Expensicons';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import compose from '@libs/compose';
import Navigation from '@libs/Navigation/Navigation';
import * as PolicyUtils from '@libs/PolicyUtils';
import * as ReportUtils from '@libs/ReportUtils';
import * as UserUtils from '@libs/UserUtils';
import * as Policy from '@userActions/Policy';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import withPolicy, {policyDefaultProps, policyPropTypes} from './withPolicy';
import WorkspacePageWithSections from './WorkspacePageWithSections';

const propTypes = {
    /** Constant, list of available currencies */
    currencyList: PropTypes.objectOf(
        PropTypes.shape({
            /** Symbol of the currency */
            symbol: PropTypes.string.isRequired,
        }),
    ),

    /** The route object passed to this page from the navigator */
    route: PropTypes.shape({
        /** Each parameter passed via the URL */
        params: PropTypes.shape({
            /** The policyID that is being configured */
            policyID: PropTypes.string.isRequired,
        }).isRequired,
    }).isRequired,

    ...policyPropTypes,
};

const defaultProps = {
    currencyList: {},
    ...policyDefaultProps,
};

function WorkspaceOverviewPage({policy, currencyList, route}) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    const formattedCurrency = !_.isEmpty(policy) && !_.isEmpty(currencyList) ? `${policy.outputCurrency} - ${currencyList[policy.outputCurrency].symbol}` : '';

    const onPressCurrency = useCallback(() => Navigation.navigate(ROUTES.WORKSPACE_OVERVIEW_CURRENCY.getRoute(policy.id)), [policy.id]);
    const onPressName = useCallback(() => Navigation.navigate(ROUTES.WORKSPACE_OVERVIEW_NAME.getRoute(policy.id)), [policy.id]);

    const policyName = lodashGet(policy, 'name', '');
    const readOnly = !PolicyUtils.isPolicyAdmin(policy);

    return (
        <WorkspacePageWithSections
            headerText={translate('workspace.common.overview')}
            route={route}
            guidesCallTaskID={CONST.GUIDES_CALL_TASK_IDS.WORKSPACE_OVERVIEW}
            shouldShowLoading={false}
            shouldUseScrollView
            shouldShowOfflineIndicatorInWideScreen
            shouldShowNonAdmin
        >
            {(hasVBA) => (
                <>
                    <AvatarWithImagePicker
                        onViewPhotoPress={() => Navigation.navigate(ROUTES.WORKSPACE_AVATAR.getRoute(policy.id))}
                        source={lodashGet(policy, 'avatar')}
                        size={CONST.AVATAR_SIZE.XLARGE}
                        avatarStyle={styles.avatarXLarge}
                        DefaultAvatar={() => (
                            <Avatar
                                containerStyles={styles.avatarXLarge}
                                imageStyles={[styles.avatarXLarge, styles.alignSelfCenter]}
                                source={policy.avatar ? policy.avatar : ReportUtils.getDefaultWorkspaceAvatar(policyName)}
                                fallbackIcon={Expensicons.FallbackWorkspaceAvatar}
                                size={CONST.AVATAR_SIZE.XLARGE}
                                name={policyName}
                                type={CONST.ICON_TYPE_WORKSPACE}
                            />
                        )}
                        type={CONST.ICON_TYPE_WORKSPACE}
                        fallbackIcon={Expensicons.FallbackWorkspaceAvatar}
                        style={[styles.mb3, styles.mt5]}
                        isUsingDefaultAvatar={!lodashGet(policy, 'avatar', null)}
                        onImageSelected={(file) => Policy.updateWorkspaceAvatar(lodashGet(policy, 'id', ''), file)}
                        onImageRemoved={() => Policy.deleteWorkspaceAvatar(lodashGet(policy, 'id', ''))}
                        editorMaskImage={Expensicons.ImageCropSquareMask}
                        pendingAction={lodashGet(policy, 'pendingFields.avatar', null)}
                        errors={lodashGet(policy, 'errorFields.avatar', null)}
                        onErrorClose={() => Policy.clearAvatarErrors(policy.id)}
                        previewSource={UserUtils.getFullSizeAvatar(policy.avatar, '')}
                        headerTitle={translate('workspace.common.workspaceAvatar')}
                        originalFileName={policy.originalFileName}
                        disabled={readOnly}
                        disabledStyle={styles.cursorDefault}
                    />
                    <OfflineWithFeedback pendingAction={lodashGet(policy, 'pendingFields.generalSettings')}>
                        <MenuItemWithTopDescription
                            title={policy.name}
                            description={translate('workspace.editor.nameInputLabel')}
                            shouldShowRightIcon={!readOnly}
                            disabled={readOnly}
                            onPress={onPressName}
                            shouldGreyOutWhenDisabled={false}
                            shouldUseDefaultCursorWhenDisabled
                        />

                        <View>
                            <MenuItemWithTopDescription
                                title={formattedCurrency}
                                description={translate('workspace.editor.currencyInputLabel')}
                                shouldShowRightIcon={!readOnly}
                                disabled={hasVBA || readOnly}
                                onPress={onPressCurrency}
                                shouldGreyOutWhenDisabled={false}
                                shouldUseDefaultCursorWhenDisabled
                            />
                            <Text style={[styles.textLabel, styles.colorMuted, styles.mt1, styles.mh5]}>
                                {hasVBA ? translate('workspace.editor.currencyInputDisabledText') : translate('workspace.editor.currencyInputHelpText')}
                            </Text>
                        </View>
                    </OfflineWithFeedback>
                </>
            )}
        </WorkspacePageWithSections>
    );
}

WorkspaceOverviewPage.propTypes = propTypes;
WorkspaceOverviewPage.defaultProps = defaultProps;
WorkspaceOverviewPage.displayName = 'WorkspaceOverviewPage';

export default compose(
    withPolicy,
    withOnyx({
        currencyList: {key: ONYXKEYS.CURRENCY_LIST},
    }),
)(WorkspaceOverviewPage);
