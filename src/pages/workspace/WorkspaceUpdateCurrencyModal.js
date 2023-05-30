import React from 'react';
import {withOnyx} from 'react-native-onyx';
import PropTypes from 'prop-types';
import compose from '../../libs/compose';
import ONYXKEYS from '../../ONYXKEYS';
import ConfirmModal from '../../components/ConfirmModal';
import withLocalize, {withLocalizePropTypes} from '../../components/withLocalize';

const propTypes = {
    /** Reimbursement account data */
    policy: PropTypes.shape({
        outputCurrency: PropTypes.string,
    }),

    ...withLocalizePropTypes,
};

const defaultProps = {
    policy: {
        outputCurrency: 'USD',
    },
};

const WorkspaceUpdateCurrencyModal = (props) => (
        <ConfirmModal
        title={props.translate('workspace.common.delete')}
        isVisible={isDeleteModalOpen}
        onConfirm={confirmDeleteAndHideModal}
        onCancel={() => setIsDeleteModalOpen(false)}
        prompt={props.translate('workspace.common.deleteConfirmation')}
        confirmText={props.translate('common.delete')}
        cancelText={props.translate('common.cancel')}
        danger
    />
);

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
