import lodashGet from 'lodash/get';
import React, {Component} from 'react';
import {View} from 'react-native';
import withCurrentUserPersonalDetails, {withCurrentUserPersonalDetailsPropTypes, withCurrentUserPersonalDetailsDefaultProps} from '../../../components/withCurrentUserPersonalDetails';
import ScreenWrapper from '../../../components/ScreenWrapper';
import HeaderWithCloseButton from '../../../components/HeaderWithCloseButton';
import withLocalize, {withLocalizePropTypes} from '../../../components/withLocalize';
import * as Localize from '../../../libs/Localize';
import ROUTES from '../../../ROUTES';
import Form from '../../../components/Form';
import ONYXKEYS from '../../../ONYXKEYS';
import CONST from '../../../CONST';
import * as ValidationUtils from '../../../libs/ValidationUtils';
import TextInput from '../../../components/TextInput';
import Text from '../../../components/Text';
import styles from '../../../styles/styles';
import Navigation from '../../../libs/Navigation/Navigation';
import * as PersonalDetails from '../../../libs/actions/PersonalDetails';
import compose from '../../../libs/compose';
import Picker from '../../../components/Picker';

const propTypes = {
    ...withLocalizePropTypes,
    ...withCurrentUserPersonalDetailsPropTypes,
};

const defaultProps = {
    ...withCurrentUserPersonalDetailsDefaultProps,
};

class PronounsPage extends Component {
    constructor(props) {
        super(props);

        this.validate = this.validate.bind(this);
        this.updatePronouns = this.updatePronouns.bind(this);
        this.setPronouns = this.setPronouns.bind(this);

        this.pronouns = props.currentUserPersonalDetails.pronouns;
        this.state = {
            hasSelfSelectedPronouns: !_.isEmpty(props.currentUserPersonalDetails.pronouns) && !props.currentUserPersonalDetails.pronouns.startsWith(CONST.PRONOUNS.PREFIX),
        };
    }

    /**
     * @param {String} pronouns
     */
        setPronouns(pronouns) {
        const hasSelfSelectedPronouns = pronouns === CONST.PRONOUNS.SELF_SELECT;
        this.pronouns = hasSelfSelectedPronouns ? '' : pronouns;

        if (this.state.hasSelfSelectedPronouns === hasSelfSelectedPronouns) {
            return;
        }

        this.setState({hasSelfSelectedPronouns});
    }

    /**
     * Submit form to update personal details
     * @param {Object} values
     * @param {String} values.pronouns
     * @param {String} values.selfSelectedPronoun
     */
    updatePronouns(values) {
        PersonalDetails.updatePronouns(
            this.state.hasSelfSelectedPronouns ? values.selfSelectedPronoun.trim() : values.pronouns.trim(),
        );
    }

    /**
     * @param {Object} values - An object containing the value of each inputID
     * @param {String} values.pronouns
     * @param {String} values.selfSelectedPronoun
     * @returns {Object} - An object containing the errors for each inputID
     */
    validate(values) {
        const errors = {};

        const [hasPronounError] = ValidationUtils.doesFailCharacterLimitAfterTrim(
            CONST.FORM_CHARACTER_LIMIT,
            [values.pronouns],
        );

        if (hasPronounError) {
            errors.pronouns = Localize.translateLocal('personalDetails.error.characterLimit', {limit: CONST.FORM_CHARACTER_LIMIT});
        }

        return errors;
    }

    render() {
        const pronounsList = _.map(this.props.translate('pronouns'), (value, key) => ({
            label: value,
            value: `${CONST.PRONOUNS.PREFIX}${key}`,
        }));
        const pronounsPickerValue = this.state.hasSelfSelectedPronouns ? CONST.PRONOUNS.SELF_SELECT : this.pronouns;

        return (
            <ScreenWrapper>
                <HeaderWithCloseButton
                    title={this.props.translate('pronounsPage.pronouns')}
                    shouldShowBackButton
                    onBackButtonPress={() => Navigation.navigate(ROUTES.SETTINGS_PROFILE)}
                    onCloseButtonPress={() => Navigation.dismissModal(true)}
                />
                <Form
                    style={[styles.flexGrow1, styles.ph5]}
                    formID={ONYXKEYS.FORMS.PRONOUNS_FORM}
                    validate={this.validate}
                    onSubmit={this.updatePronouns}
                    submitButtonText={this.props.translate('common.save')}
                    enabledWhenOffline
                >
                    <Text style={[styles.mb6]}>
                        {this.props.translate('displayNamePage.isShownOnProfile')}
                    </Text>
                    <View>
                        <Picker
                            inputID="pronouns"
                            label={this.props.translate('profilePage.preferredPronouns')}
                            items={pronounsList}
                            placeholder={{
                                value: '',
                                label: this.props.translate('profilePage.selectYourPronouns'),
                            }}
                            defaultValue={pronounsPickerValue}
                            onValueChange={this.setPronouns}
                        />
                        {this.state.hasSelfSelectedPronouns && (
                            <View style={styles.mt2}>
                                <TextInput
                                    inputID="selfSelectedPronoun"
                                    defaultValue={this.pronouns}
                                    placeholder={this.props.translate('profilePage.selfSelectYourPronoun')}
                                />
                            </View>
                        )}
                    </View>
                </Form>
            </ScreenWrapper>
        )
    }
}

PronounsPage.propTypes = propTypes;
PronounsPage.defaultProps = defaultProps;

export default compose(
    withLocalize,
    withCurrentUserPersonalDetails,
)(PronounsPage);
