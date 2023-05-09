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
import FireworksAnimation from '../../../assets/animations/Fireworks.json';
import themeColors from '../../styles/themes/default';

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
};

const defaultProps = {
    currencyList: {},
    ...policyDefaultProps,
};

function WorkspaceSettingsPage(props) {
    const nameIsRequiredError = props.translate('workspace.editor.nameIsRequiredError');

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
            Navigation.navigate(ROUTES.getWorkspaceInitialRoute(props.policy.id));
        },
        [props.policy.id, props.policy.isPolicyUpdating],
    );

    const validate = useCallback(
        (values) => {
            const errors = {};
            const name = values.name.trim();

            if (!name || !name.length) {
                errors.name = nameIsRequiredError;
            }

            return errors;
        },
        [nameIsRequiredError],
    );

    const policyName = lodashGet(this.props.policy, 'name', '');

    return (
        <WorkspacePageWithSections
            headerText={this.props.translate('workspace.common.settings')}
            route={this.props.route}
            guidesCallTaskID={CONST.GUIDES_CALL_TASK_IDS.WORKSPACE_SETTINGS}
            backgroundColor={themeColors.workspaceSettingsPageBackgroundColor}
            illustration={FireworksAnimation}
        >
            {(hasVBA) => (
                <Form
                    formID={ONYXKEYS.FORMS.WORKSPACE_SETTINGS_FORM}
                    submitButtonText={this.props.translate('workspace.editor.save')}
                    style={[styles.mh5, styles.flexGrow1]}
                    scrollContextEnabled
                    validate={this.validate}
                    onSubmit={this.submit}
                    enabledWhenOffline
                >
                    <OfflineWithFeedback
                        pendingAction={lodashGet(this.props.policy, 'pendingFields.avatar', null)}
                        errors={lodashGet(this.props.policy, 'errorFields.avatar', null)}
                        onClose={() => Policy.clearAvatarErrors(this.props.policy.id)}
                    >
                        <AvatarWithImagePicker
                            isUploading={this.props.policy.isAvatarUploading}
                            source={lodashGet(this.props.policy, 'avatar')}
                            size={CONST.AVATAR_SIZE.LARGE}
                            DefaultAvatar={() => (
                                <Avatar
                                    containerStyles={styles.avatarLarge}
                                    imageStyles={[styles.avatarLarge, styles.alignSelfCenter]}
                                    source={this.props.policy.avatar ? this.props.policy.avatar : ReportUtils.getDefaultWorkspaceAvatar(policyName)}
                                    fallbackIcon={Expensicons.FallbackWorkspaceAvatar}
                                    size={CONST.AVATAR_SIZE.LARGE}
                                    name={policyName}
                                    type={CONST.ICON_TYPE_WORKSPACE}
                                />
                            )}
                            type={CONST.ICON_TYPE_WORKSPACE}
                            fallbackIcon={Expensicons.FallbackWorkspaceAvatar}
                            style={[styles.mb3]}
                            anchorPosition={{top: 172, right: 18}}
                            isUsingDefaultAvatar={!lodashGet(this.props.policy, 'avatar', null)}
                            onImageSelected={(file) => Policy.updateWorkspaceAvatar(lodashGet(this.props.policy, 'id', ''), file)}
                            onImageRemoved={() => Policy.deleteWorkspaceAvatar(lodashGet(this.props.policy, 'id', ''))}
                            editorMaskImage={Expensicons.ImageCropSquareMask}
                        />
                    </OfflineWithFeedback>
                    <OfflineWithFeedback pendingAction={lodashGet(this.props.policy, 'pendingFields.generalSettings')}>
                        <TextInput
                            inputID="name"
                            label={this.props.translate('workspace.editor.nameInputLabel')}
                            containerStyles={[styles.mt4]}
                            defaultValue={this.props.policy.name}
                            maxLength={CONST.WORKSPACE_NAME_CHARACTER_LIMIT}
                        />
                        <View style={[styles.mt4]}>
                            <Picker
                                inputID="currency"
                                label={this.props.translate('workspace.editor.currencyInputLabel')}
                                items={this.getCurrencyItems()}
                                isDisabled={hasVBA}
                                defaultValue={this.props.policy.outputCurrency}
                                hintText={hasVBA ? this.props.translate('workspace.editor.currencyInputDisabledText') : this.props.translate('workspace.editor.currencyInputHelpText')}
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
    withOnyx({
        currencyList: {key: ONYXKEYS.CURRENCY_LIST},
    }),
    withLocalize,
    withNetwork(),
)(WorkspaceSettingsPage);
