import React, {Component} from 'react';
import {View} from 'react-native';
import lodashGet from 'lodash/get';
import TextInput from '../../components/TextInput';
import withLocalize, {withLocalizePropTypes} from '../../components/withLocalize';
import ScreenWrapper from '../../components/ScreenWrapper';
import HeaderWithCloseButton from '../../components/HeaderWithCloseButton';
import Form from '../../components/Form';
import ONYXKEYS from '../../ONYXKEYS';
import styles from '../../styles/styles';
import Navigation from '../../libs/Navigation/Navigation';
import compose from '../../libs/compose';
import withMoneyRequest, {moneyRequestPropTypes} from './withMoneyRequest';

const propTypes = {
    ...withLocalizePropTypes,
    ...moneyRequestPropTypes,
};

class MoneyRequestDescriptionPage extends Component {
    constructor(props) {
        super(props);

        this.updateComment = this.updateComment.bind(this);
    }

    componentDidMount() {
        const iouType = lodashGet(this.props.route, 'params.iouType', '');
        const reportID = lodashGet(this.props.route, 'params.reportID', '');
        this.props.redirectIfEmpty([this.props.participants, this.props.amount], iouType, reportID);
    }

    /**
     * Sets the money request comment by saving it to Onyx.
     *
     * @param {Object} value
     * @param {String} value.moneyRequestComment
     */
    updateComment(value) {
        this.props.setComment(value.moneyRequestComment);
        Navigation.goBack();
    }

    render() {
        return (
            <ScreenWrapper includeSafeAreaPaddingBottom={false} shouldEnableMaxHeight>
                <HeaderWithCloseButton
                    title={this.props.translate('common.description')}
                    shouldShowBackButton
                    onBackButtonPress={Navigation.goBack}
                    onCloseButtonPress={Navigation.dismissModal}
                />
                <Form
                    style={[styles.flexGrow1, styles.ph5]}
                    formID={ONYXKEYS.FORMS.MONEY_REQUEST_DESCRIPTION_FORM}
                    onSubmit={this.updateComment}
                    submitButtonText={this.props.translate('common.save')}
                    validate={() => ({})}
                    enabledWhenOffline
                >
                    <View style={styles.mb4}>
                        <TextInput
                            inputID="moneyRequestComment"
                            name="moneyRequestComment"
                            defaultValue={this.props.comment}
                            label={this.props.translate('moneyRequestConfirmationList.whatsItFor')}
                        />
                    </View>
                </Form>
            </ScreenWrapper>
        );
    }
}

MoneyRequestDescriptionPage.propTypes = propTypes;

export default compose(
    withLocalize,
    withMoneyRequest,
)(MoneyRequestDescriptionPage);
