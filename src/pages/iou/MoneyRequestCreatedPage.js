import React, {Component} from 'react';
import {withOnyx} from 'react-native-onyx';
import PropTypes from 'prop-types';
import _ from 'underscore';
import lodashGet from 'lodash/get';
import CONST from '../../CONST';
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
import NewDatePicker from '../../components/NewDatePicker';

const propTypes = {
    ...withLocalizePropTypes,

    /** Onyx Props */
    /** Holds data related to Money Request view state, rather than the underlying Money Request data. */
    iou: PropTypes.shape({
        id: PropTypes.string,
        amount: PropTypes.number,
        comment: PropTypes.string,
        created: PropTypes.string,
        participants: PropTypes.arrayOf(optionPropTypes),
    }),
};

const defaultProps = {
    iou: {
        id: '',
        amount: 0,
        comment: '',
        created: '',
        participants: [],
    },
};

class MoneyRequestCreatedPage extends Component {
    constructor(props) {
        super(props);

        this.updateDate = this.updateDate.bind(this);
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
     * @param {String} value.moneyRequestCreated
     */
    updateDate(value) {
        IOU.setMoneyRequestCreated(value.moneyRequestCreated);
        this.navigateBack();
    }

    render() {
        return (
            <ScreenWrapper
                includeSafeAreaPaddingBottom={false}
                shouldEnableMaxHeight
            >
                <HeaderWithBackButton
                    title={this.props.translate('common.date')}
                    onBackButtonPress={this.navigateBack}
                />
                <Form
                    style={[styles.flexGrow1, styles.ph5]}
                    formID={ONYXKEYS.FORMS.MONEY_REQUEST_CREATED_FORM}
                    onSubmit={this.updateDate}
                    submitButtonText={this.props.translate('common.save')}
                    enabledWhenOffline
                >
                    <NewDatePicker
                        inputID="moneyRequestCreated"
                        label={this.props.translate('common.date')}
                        defaultValue={this.props.iou.created}
                        maxDate={new Date()}
                    />
                </Form>
            </ScreenWrapper>
        );
    }
}

MoneyRequestCreatedPage.propTypes = propTypes;
MoneyRequestCreatedPage.defaultProps = defaultProps;

export default compose(
    withLocalize,
    withOnyx({
        iou: {key: ONYXKEYS.IOU},
    }),
)(MoneyRequestCreatedPage);
