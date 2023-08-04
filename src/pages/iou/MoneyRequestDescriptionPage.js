import React, {Component} from 'react';
import {View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import PropTypes from 'prop-types';
import _ from 'underscore';
import lodashGet from 'lodash/get';
import TextInput from '../../components/TextInput';
import withLocalize, {withLocalizePropTypes} from '../../components/withLocalize';
import ScreenWrapper from '../../components/ScreenWrapper';
import HeaderWithBackButton from '../../components/HeaderWithBackButton';
import Form from '../../components/Form';
import ONYXKEYS from '../../ONYXKEYS';
import styles from '../../styles/styles';
import Navigation from '../../libs/Navigation/Navigation';
import ROUTES from '../../ROUTES';
import compose from '../../libs/compose';
import * as IOU from '../../libs/actions/IOU';
import optionPropTypes from '../../components/optionPropTypes';
import CONST from '../../CONST';

const propTypes = {
    ...withLocalizePropTypes,

    /** Onyx Props */
    /** Holds data related to Money Request view state, rather than the underlying Money Request data. */
    iou: PropTypes.shape({
        id: PropTypes.string,
        amount: PropTypes.number,
        comment: PropTypes.string,
        participants: PropTypes.arrayOf(optionPropTypes),
    }),
};

const defaultProps = {
    iou: {
        id: '',
        amount: 0,
        comment: '',
        participants: [],
    },
};

class MoneyRequestDescriptionPage extends Component {
    constructor(props) {
        super(props);

        this.updateComment = this.updateComment.bind(this);
        this.navigateBack = this.navigateBack.bind(this);
        this.iouType = lodashGet(props.route, 'params.iouType', '');
        this.reportID = lodashGet(props.route, 'params.reportID', '');
    }

    componentDidMount() {
        const moneyRequestId = `${this.iouType}${this.reportID}`;
        const shouldReset = this.props.iou.id !== moneyRequestId;
        if (shouldReset) {
            IOU.resetMoneyRequestInfo(moneyRequestId);
        }

        if (_.isEmpty(this.props.iou.participants) || (this.props.iou.amount === 0 && !this.props.iou.receiptPath) || shouldReset) {
            Navigation.goBack(ROUTES.getMoneyRequestRoute(this.iouType, this.reportID), true);
        }
    }

    // eslint-disable-next-line rulesdir/prefer-early-return
    componentDidUpdate(prevProps) {
        // ID in Onyx could change by initiating a new request in a separate browser tab or completing a request
        if (_.isEmpty(this.props.iou.participants) || (this.props.iou.amount === 0 && !this.props.iou.receiptPath) || prevProps.iou.id !== this.props.iou.id) {
            // The ID is cleared on completing a request. In that case, we will do nothing.
            if (this.props.iou.id) {
                Navigation.goBack(ROUTES.getMoneyRequestRoute(this.iouType, this.reportID), true);
            }
        }
    }

    navigateBack() {
        Navigation.goBack(ROUTES.getMoneyRequestConfirmationRoute(this.iouType, this.reportID));
    }

    /**
     * Sets the money request comment by saving it to Onyx.
     *
     * @param {Object} value
     * @param {String} value.moneyRequestComment
     */
    updateComment(value) {
        IOU.setMoneyRequestDescription(value.moneyRequestComment);
        this.navigateBack();
    }

    render() {
        return (
            <ScreenWrapper
                includeSafeAreaPaddingBottom={false}
                shouldEnableMaxHeight
                onEntryTransitionEnd={() => this.descriptionInputRef && this.descriptionInputRef.focus()}
            >
                <HeaderWithBackButton
                    title={this.props.translate('common.description')}
                    onBackButtonPress={this.navigateBack}
                />
                <Form
                    style={[styles.flexGrow1, styles.ph5]}
                    formID={ONYXKEYS.FORMS.MONEY_REQUEST_DESCRIPTION_FORM}
                    onSubmit={this.updateComment}
                    submitButtonText={this.props.translate('common.save')}
                    enabledWhenOffline
                >
                    <View style={styles.mb4}>
                        <TextInput
                            inputID="moneyRequestComment"
                            name="moneyRequestComment"
                            defaultValue={this.props.iou.comment}
                            label={this.props.translate('moneyRequestConfirmationList.whatsItFor')}
                            accessibilityLabel={this.props.translate('moneyRequestConfirmationList.whatsItFor')}
                            accessibilityRole={CONST.ACCESSIBILITY_ROLE.TEXT}
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
