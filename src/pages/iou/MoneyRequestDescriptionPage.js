import React, {Component} from 'react';
import {View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import PropTypes from 'prop-types';
import TextInput from '../../components/TextInput';
import withLocalize, {withLocalizePropTypes} from '../../components/withLocalize';
import ScreenWrapper from '../../components/ScreenWrapper';
import HeaderWithCloseButton from '../../components/HeaderWithCloseButton';
import Form from '../../components/Form';
import ONYXKEYS from '../../ONYXKEYS';
import styles from '../../styles/styles';
import Navigation from '../../libs/Navigation/Navigation';
import compose from '../../libs/compose';
import * as IOU from '../../libs/actions/IOU';

const propTypes = {
    ...withLocalizePropTypes,

    /** Onyx Props */
    /** Holds data related to Money Request view state, rather than the underlying Money Request data. */
    iou: PropTypes.shape({
        comment: PropTypes.string,
    }),
};

const defaultProps = {
    iou: {
        comment: '',
    },
};

class MoneyRequestDescriptionPage extends Component {
    constructor(props) {
        super(props);

        this.updateComment = this.updateComment.bind(this);
    }

    /**
     * Closes the modal and clears the description from Onyx.
     */
    onCloseButtonPress() {
        IOU.setMoneyRequestDescription('');
        Navigation.dismissModal();
    }

    /**
     * Sets the money request comment by saving it to Onyx.
     *
     * @param {Object} value
     * @param {String} value.moneyRequestComment
     */
    updateComment(value) {
        IOU.setMoneyRequestDescription(value.moneyRequestComment);
        Navigation.goBack();
    }

    render() {
        return (
            <ScreenWrapper
                includeSafeAreaPaddingBottom={false}
                shouldEnableMaxHeight
                onEntryTransitionEnd={() => this.descriptionInputRef && this.descriptionInputRef.focus()}
            >
                <HeaderWithCloseButton
                    title={this.props.translate('common.description')}
                    shouldShowBackButton
                    onBackButtonPress={Navigation.goBack}
                    onCloseButtonPress={this.onCloseButtonPress}
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
                            defaultValue={this.props.iou.comment}
                            label={this.props.translate('moneyRequestConfirmationList.whatsItFor')}
                            ref={(el) => (this.descriptionInputRef = el)}
                        />
                    </View>
                </Form>
            </ScreenWrapper>
        );
    }
}

MoneyRequestDescriptionPage.propTypes = propTypes;
MoneyRequestDescriptionPage.defaultProps = defaultProps;

export default compose(
    withLocalize,
    withOnyx({
        iou: {key: ONYXKEYS.IOU},
    }),
)(MoneyRequestDescriptionPage);
