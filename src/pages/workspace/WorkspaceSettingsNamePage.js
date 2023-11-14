import {useFocusEffect} from '@react-navigation/native';
import lodashGet from 'lodash/get';
import PropTypes from 'prop-types';
import React, {useCallback, useRef} from 'react';
import {Keyboard, View} from 'react-native';
import _ from 'underscore';
import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import TextInput from '@components/TextInput/index';
import useLocalize from '@hooks/useLocalize';
import * as Browser from '@libs/Browser';
import Navigation from '@libs/Navigation/Navigation';
import * as PolicyUtils from '@libs/PolicyUtils';
import * as ValidationUtils from '@libs/ValidationUtils';
import styles from '@styles/styles';
import * as Policy from '@userActions/Policy';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import {policyDefaultProps, policyPropTypes} from './withPolicy';
import withPolicyAndFullscreenLoading from './withPolicyAndFullscreenLoading';

const propTypes = {
    isLoadingReportData: PropTypes.bool,
    ...policyPropTypes,
};

const defaultProps = {
    isLoadingReportData: true,
    ...policyDefaultProps,
};

function WorkSpaceSettingsNamePage({policy, isLoadingReportData}) {
    const {translate} = useLocalize();

    const focusTimeoutRef = useRef();

    const inputRef = useRef();

    const onBackButtonPress = useCallback(() => Navigation.goBack(ROUTES.WORKSPACE_SETTINGS.getRoute(policy.id)), [policy.id]);

    const validate = useCallback((values) => {
        const errors = {};
        const name = values.name.trim();

        if (!ValidationUtils.isRequiredFulfilled(name)) {
            errors.name = 'workspace.editor.nameIsRequiredError';
        } else if ([...name].length > CONST.WORKSPACE_NAME_CHARACTER_LIMIT) {
            // Uses the spread syntax to count the number of Unicode code points instead of the number of UTF-16
            // code units.
            errors.name = 'workspace.editor.nameIsTooLongError';
        }

        return errors;
    }, []);

    const submit = useCallback(
        (values) => {
            if (policy.isPolicyUpdating) {
                return;
            }
            Policy.updateGeneralSettings(policy.id, values.name, policy.outputCurrency);
            Keyboard.dismiss();
            Navigation.goBack(ROUTES.WORKSPACE_SETTINGS.getRoute(policy.id));
        },
        [policy.id, policy.isPolicyUpdating, policy.outputCurrency],
    );

    useFocusEffect(
        useCallback(() => {
            focusTimeoutRef.current = setTimeout(() => {
                if (inputRef.current) {
                    inputRef.current.focus();
                }
                return () => {
                    if (!focusTimeoutRef.current) {
                        return;
                    }
                    clearTimeout(focusTimeoutRef.current);
                };
            }, CONST.ANIMATED_TRANSITION);
        }, []),
    );

    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom={false}
            testID={WorkSpaceSettingsNamePage.displayName}
        >
            <FullPageNotFoundView
                onBackButtonPress={() => Navigation.goBack(ROUTES.SETTINGS_WORKSPACES)}
                shouldShow={(_.isEmpty(policy) && !isLoadingReportData) || !PolicyUtils.isPolicyAdmin(policy) || PolicyUtils.isPendingDeletePolicy(policy)}
                subtitleKey={_.isEmpty(policy) ? undefined : 'workspace.common.notAuthorized'}
            >
                <HeaderWithBackButton
                    title={translate('workspace.editor.nameInputLabel')}
                    onBackButtonPress={onBackButtonPress}
                />
                <FormProvider
                    style={[styles.flexGrow1, styles.ph5]}
                    formID={ONYXKEYS.FORMS.WORKSPACE_EDIT_NAME}
                    validate={validate}
                    onSubmit={submit}
                    submitButtonText={translate('common.save')}
                    enabledWhenOffline
                >
                    <View style={[styles.mb4]}>
                        <InputWrapper
                            InputComponent={TextInput}
                            accessibilityRole={CONST.ACCESSIBILITY_ROLE.TEXT}
                            inputID="name"
                            name="name"
                            submitOnEnter={!Browser.isMobile()}
                            textAlignVertical="top"
                            maxLength={CONST.WORKSPACE_NAME_CHARACTER_LIMIT}
                            label={translate('workspace.editor.nameInputLabel')}
                            accessibilityLabel={translate('workspace.editor.nameInputLabel')}
                            defaultValue={lodashGet(policy, 'name', '')}
                            ref={(el) => {
                                if (!el) {
                                    return;
                                }
                                inputRef.current = el;
                            }}
                        />
                    </View>
                </FormProvider>
            </FullPageNotFoundView>
        </ScreenWrapper>
    );
}

WorkSpaceSettingsNamePage.displayName = 'WorkspaceSettingsNamePage';
WorkSpaceSettingsNamePage.propTypes = propTypes;
WorkSpaceSettingsNamePage.defaultProps = defaultProps;

export default withPolicyAndFullscreenLoading(WorkSpaceSettingsNamePage);
