import React, {useState, useCallback} from 'react';
import {withOnyx} from 'react-native-onyx';
import PropTypes from 'prop-types';
import compose from '../../libs/compose';
import ONYXKEYS from '../../ONYXKEYS';
import CONST from '../../CONST';
import ConfirmModal from '../../components/ConfirmModal';
import withLocalize, {withLocalizePropTypes} from '../../components/withLocalize';
import * as Policy from '../../libs/actions/Policy';
import * as ReimbursementAccount from '../../libs/actions/ReimbursementAccount';

const propTypes = {
    /** Reimbursement account data */
    policy: PropTypes.shape({
        id: PropTypes.string,
        name: PropTypes.string,
        outputCurrency: PropTypes.string,
    }),

    ...withLocalizePropTypes,
};

const defaultProps = {
    policy: {
        id: '',
        name: '',
        outputCurrency: 'USD',
    },
};

const WorkspaceUpdateCurrencyModal = (props) => {
    const [isVisible, setIsVisible] = useState(props.policy.outputCurrency !== CONST.CURRENCY.USD);

    /**
     * Call update workspace currency and hide the modal
     */
    const confirmCurrencyChangeAndHideModal = useCallback(() => {
        Policy.updateGeneralSettings(props.policy.id, props.policy.name, CONST.CURRENCY.USD);
        setIsVisible(false);
        ReimbursementAccount.navigateToBankAccountRoute(props.policy.id)
    }, [props.policy]);

    return (
        <ConfirmModal
            title={props.translate('workspace.common.delete')}
            isVisible={isVisible}
            onConfirm={confirmCurrencyChangeAndHideModal}
            onCancel={() => setIsVisible(false)}
            prompt={props.translate('workspace.common.deleteConfirmation')}
            confirmText={props.translate('common.delete')}
            cancelText={props.translate('common.cancel')}
            danger
        />
    )
};

WorkspaceUpdateCurrencyModal.displayName = 'WorkspaceUpdateCurrencyModal';
WorkspaceUpdateCurrencyModal.propTypes = propTypes;
WorkspaceUpdateCurrencyModal.defaultProps = defaultProps;

export default compose(
    withLocalize,
    withOnyx({
        policy: {
            key: ({route}) => `${ONYXKEYS.COLLECTION.POLICY}${route.params.policyID}`,
        },
    }),
)(WorkspaceUpdateCurrencyModal);
