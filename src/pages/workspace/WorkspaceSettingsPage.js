import React, {useCallback, useMemo} from 'react';
import {Keyboard, View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import PropTypes from 'prop-types';
import _ from 'underscore';
import lodashGet from 'lodash/get';
import ONYXKEYS from '../../ONYXKEYS';
import withLocalize, {withLocalizePropTypes} from '../../components/withLocalize';
import styles from '../../styles/styles';
import compose from '../../libs/compose';
import * as Policy from '../../libs/actions/Policy';
import * as Expensicons from '../../components/Icon/Expensicons';
import AvatarWithImagePicker from '../../components/AvatarWithImagePicker';
import CONST from '../../CONST';
import Picker from '../../components/Picker';
import TextInput from '../../components/TextInput';
import WorkspacePageWithSections from './WorkspacePageWithSections';
import withPolicy, {policyPropTypes, policyDefaultProps} from './withPolicy';
import {withNetwork} from '../../components/OnyxProvider';
import OfflineWithFeedback from '../../components/OfflineWithFeedback';
import Form from '../../components/Form';
import * as ReportUtils from '../../libs/ReportUtils';
import Avatar from '../../components/Avatar';
import Navigation from '../../libs/Navigation/Navigation';
import ROUTES from '../../ROUTES';
import withWindowDimensions, {windowDimensionsPropTypes} from '../../components/withWindowDimensions';

const propTypes = {
    // The currency list constant object from Onyx
    currencyList: PropTypes.objectOf(
        PropTypes.shape({
            // Symbol for the currency
            symbol: PropTypes.string,
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
    const currencyItems = useMemo(() => {
        const currencyListKeys = _.keys(props.currencyList);
        return _.map(currencyListKeys, (currencyCode) => ({
            value: currencyCode,
            label: `${currencyCode} - ${props.currencyList[currencyCode].symbol}`,
        }));
    }, [props.currencyList]);

    const submit = useCallback(
        (values) => {
            if (props.policy.isPolicyUpdating) {
                return;
            }
            const outputCurrency = values.currency;
            Policy.updateGeneralSettings(props.policy.id, values.name.trim(), outputCurrency);
            Keyboard.dismiss();
            Navigation.goBack(ROUTES.getWorkspaceInitialRoute(props.policy.id));
        },
        [props.policy.id, props.policy.isPolicyUpdating],
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
                    style={[styles.mh5, styles.flexGrow1]}
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
                    />
                    <OfflineWithFeedback pendingAction={lodashGet(props.policy, 'pendingFields.generalSettings')}>
                        <TextInput
                            accessibilityRole={CONST.ACCESSIBILITY_ROLE.TEXT}
                            inputID="name"
                            label={props.translate('workspace.editor.nameInputLabel')}
                            accessibilityLabel={props.translate('workspace.editor.nameInputLabel')}
                            containerStyles={[styles.mt4]}
                            defaultValue={props.policy.name}
                            maxLength={CONST.WORKSPACE_NAME_CHARACTER_LIMIT}
                        />
                        <View style={[styles.mt4]}>
                            <Picker
                                inputID="currency"
                                label={props.translate('workspace.editor.currencyInputLabel')}
                                items={currencyItems}
                                isDisabled={hasVBA}
                                defaultValue={props.policy.outputCurrency}
                                hintText={hasVBA ? props.translate('workspace.editor.currencyInputDisabledText') : props.translate('workspace.editor.currencyInputHelpText')}
                            />
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
