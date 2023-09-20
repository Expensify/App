import React, {useCallback} from 'react';
import {Keyboard, View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import PropTypes from 'prop-types';
import lodashGet from 'lodash/get';
import ONYXKEYS from '../../ONYXKEYS';
import withLocalize, {withLocalizePropTypes} from '../../components/withLocalize';
import styles from '../../styles/styles';
import compose from '../../libs/compose';
import * as Policy from '../../libs/actions/Policy';
import * as Expensicons from '../../components/Icon/Expensicons';
import AvatarWithImagePicker from '../../components/AvatarWithImagePicker';
import CONST from '../../CONST';
import TextInput from '../../components/TextInput';
import WorkspacePageWithSections from './WorkspacePageWithSections';
import withPolicy, {policyPropTypes, policyDefaultProps} from './withPolicy';
import {withNetwork} from '../../components/OnyxProvider';
import OfflineWithFeedback from '../../components/OfflineWithFeedback';
import Form from '../../components/Form';
import * as ReportUtils from '../../libs/ReportUtils';
import * as UserUtils from '../../libs/UserUtils';
import Avatar from '../../components/Avatar';
import Navigation from '../../libs/Navigation/Navigation';
import ROUTES from '../../ROUTES';
import withWindowDimensions, {windowDimensionsPropTypes} from '../../components/withWindowDimensions';
import MenuItemWithTopDescription from '../../components/MenuItemWithTopDescription';
import Text from '../../components/Text';

const propTypes = {
    /** Constant, list of available currencies */
    currencyList: PropTypes.objectOf(
        PropTypes.shape({
            /** Symbol of the currency */
            symbol: PropTypes.string.isRequired,
        }),
    ),
    ...policyPropTypes,
    ...withLocalizePropTypes,
    ...windowDimensionsPropTypes,
};

const defaultProps = {
    currencyList: {},
    ...policyDefaultProps,
};

function WorkspaceSettingsPage(props) {
    const formattedCurrency = props.policy ? `${props.policy.outputCurrency} - ${props.currencyList[props.policy.outputCurrency].symbol}` : '';

    const submit = useCallback(
        (values) => {
            if (props.policy.isPolicyUpdating) {
                return;
            }

            Policy.updateGeneralSettings(props.policy.id, values.name.trim(), props.policy.outputCurrency);
            Keyboard.dismiss();
            Navigation.goBack(ROUTES.getWorkspaceInitialRoute(props.policy.id));
        },
        [props.policy.id, props.policy.isPolicyUpdating, props.policy.outputCurrency],
    );

    const validate = useCallback((values) => {
        const errors = {};
        const name = values.name.trim();

        if (!name || !name.length) {
            errors.name = 'workspace.editor.nameIsRequiredError';
        } else if ([...name].length > CONST.WORKSPACE_NAME_CHARACTER_LIMIT) {
            // Uses the spread syntax to count the number of Unicode code points instead of the number of UTF-16
            // code units.
            errors.name = 'workspace.editor.nameIsTooLongError';
        }

        return errors;
    }, []);

    const policyName = lodashGet(props.policy, 'name', '');

    return (
        <WorkspacePageWithSections
            headerText={props.translate('workspace.common.settings')}
            route={props.route}
            guidesCallTaskID={CONST.GUIDES_CALL_TASK_IDS.WORKSPACE_SETTINGS}
        >
            {(hasVBA) => (
                <Form
                    formID={ONYXKEYS.FORMS.WORKSPACE_SETTINGS_FORM}
                    submitButtonText={props.translate('workspace.editor.save')}
                    style={styles.flexGrow1}
                    scrollContextEnabled
                    validate={validate}
                    onSubmit={submit}
                    enabledWhenOffline
                >
                    <AvatarWithImagePicker
                        isUploading={props.policy.isAvatarUploading}
                        source={lodashGet(props.policy, 'avatar')}
                        size={CONST.AVATAR_SIZE.LARGE}
                        DefaultAvatar={() => (
                            <Avatar
                                containerStyles={styles.avatarLarge}
                                imageStyles={[styles.avatarLarge, styles.alignSelfCenter]}
                                source={props.policy.avatar ? props.policy.avatar : ReportUtils.getDefaultWorkspaceAvatar(policyName)}
                                fallbackIcon={Expensicons.FallbackWorkspaceAvatar}
                                size={CONST.AVATAR_SIZE.LARGE}
                                name={policyName}
                                type={CONST.ICON_TYPE_WORKSPACE}
                            />
                        )}
                        type={CONST.ICON_TYPE_WORKSPACE}
                        fallbackIcon={Expensicons.FallbackWorkspaceAvatar}
                        style={[styles.mb3]}
                        anchorPosition={styles.createMenuPositionProfile(props.windowWidth)}
                        anchorAlignment={{horizontal: CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.LEFT, vertical: CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.TOP}}
                        isUsingDefaultAvatar={!lodashGet(props.policy, 'avatar', null)}
                        onImageSelected={(file) => Policy.updateWorkspaceAvatar(lodashGet(props.policy, 'id', ''), file)}
                        onImageRemoved={() => Policy.deleteWorkspaceAvatar(lodashGet(props.policy, 'id', ''))}
                        editorMaskImage={Expensicons.ImageCropSquareMask}
                        pendingAction={lodashGet(props.policy, 'pendingFields.avatar', null)}
                        errors={lodashGet(props.policy, 'errorFields.avatar', null)}
                        onErrorClose={() => Policy.clearAvatarErrors(props.policy.id)}
                        previewSource={UserUtils.getFullSizeAvatar(props.policy.avatar, '')}
                        headerTitle={props.translate('workspace.common.workspaceAvatar')}
                        originalFileName={props.policy.originalFileName}
                    />
                    <OfflineWithFeedback pendingAction={lodashGet(props.policy, 'pendingFields.generalSettings')}>
                        <TextInput
                            accessibilityRole={CONST.ACCESSIBILITY_ROLE.TEXT}
                            inputID="name"
                            label={props.translate('workspace.editor.nameInputLabel')}
                            accessibilityLabel={props.translate('workspace.editor.nameInputLabel')}
                            containerStyles={[styles.mt4, styles.mh5]}
                            defaultValue={props.policy.name}
                            maxLength={CONST.WORKSPACE_NAME_CHARACTER_LIMIT}
                            spellCheck={false}
                        />
                        <View style={[styles.mt4]}>
                            <MenuItemWithTopDescription
                                title={formattedCurrency}
                                description={props.translate('workspace.editor.currencyInputLabel')}
                                shouldShowRightIcon
                                disabled={hasVBA}
                                onPress={() => Navigation.navigate(ROUTES.getWorkspaceSettingsCurrencyRoute(props.policy.id))}
                            />
                            <Text style={[styles.textLabel, styles.colorMuted, styles.mt2, styles.mh5]}>
                                {hasVBA ? props.translate('workspace.editor.currencyInputDisabledText') : props.translate('workspace.editor.currencyInputHelpText')}
                            </Text>
                        </View>
                    </OfflineWithFeedback>
                </Form>
            )}
        </WorkspacePageWithSections>
    );
}

WorkspaceSettingsPage.propTypes = propTypes;
WorkspaceSettingsPage.defaultProps = defaultProps;
WorkspaceSettingsPage.displayName = 'WorkspaceSettingsPage';

export default compose(
    withPolicy,
    withWindowDimensions,
    withOnyx({
        currencyList: {key: ONYXKEYS.CURRENCY_LIST},
    }),
    withLocalize,
    withNetwork(),
)(WorkspaceSettingsPage);
