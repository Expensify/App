import lodashGet from 'lodash/get';
import PropTypes from 'prop-types';
import {withOnyx} from 'react-native-onyx';
import {View} from 'react-native';
import _ from 'underscore';
import Form from '../../../../components/Form';
import HeaderWithCloseButton from '../../../../components/HeaderWithCloseButton';
import ScreenWrapper from '../../../../components/ScreenWrapper';
import withLocalize, { withLocalizePropTypes } from '../../../../components/withLocalize';
import Navigation from '../../../../libs/Navigation/Navigation';
import ONYXKEYS from '../../../../ONYXKEYS';
import ROUTES from '../../../../ROUTES';
import * as User from '../../../../libs/actions/User';
import Text from '../../../../components/Text';
import TextInput from '../../../../components/TextInput';

const propTypes = {
    /* Onyx Props */

    /** List of betas available to current user */
    betas: PropTypes.arrayOf(PropTypes.string),

    ...withLocalizePropTypes,
};

const defaultProps = {
    betas: [],
};

const SetDefaultContactMethod = (props) => {
    const contactMethod = decodeURIComponent(lodashGet(props.route, 'params.contactMethod'));

    /**
     * @param {Object} values
     * @param {String} values.password
     */
    function validate(values) {
        const errors = {};

        if (_.isEmpty(values.password)) {
            errors.password = props.translate('common.error.fieldRequired');
        }

        return errors;
    }

    return (
        <ScreenWrapper>
            <HeaderWithCloseButton
                title={props.translate('contacts.setAsDefault')}
                shouldShowBackButton
                onBackButtonPress={() => Navigation.navigate(ROUTES.getEditContactMethodRoute(contactMethod))}
                onCloseButtonPress={() => Navigation.dismissModal(true)}
            />
            <Form
                formID={ONYXKEYS.FORMS.SET_AS_DEFAULT_FORM}
                submitButtonText={props.translate('common.save')}
                validate={validate}
                onSubmit={User.setContactMethodAsDefault(contactMethod, password)}
            >
                <Text>
                    {'For your security, please re-enter your password to set a new default.'}
                </Text>
                <View>
                    <TextInput
                        inputID="password"
                        name="password"
                        label={props.translate('common.password')}
                    />
                </View>
            </Form>
        </ScreenWrapper>
    );
};

SetDefaultContactMethod.propTypes = propTypes;
SetDefaultContactMethod.defaultProps = defaultProps;
SetDefaultContactMethod.displayName = 'SetDefaultContactMethod';

export default compose(
    withLocalize,
    withOnyx({
        betas: {
            key: ONYXKEYS.BETAS,
        },
    }),
)(SetDefaultContactMethod);
