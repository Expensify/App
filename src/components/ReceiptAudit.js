import Text from './Text';
import Icon from './Icon';
import PropTypes from 'prop-types';

const propTypes = {
    notice: PropTypes.arrayOf(PropTypes.string).required
};
const defaultProps = {
    notice: [],
};

function ReceiptAudit(notice) {
    return (
        <>
            <Icon
                width={32}
                height={32}
                src={notice.length > 0 ? Expensicons.Receipt : Expensicons.Checkmark}
            />
            <Text>
                Receipt Audit • {notice.length > 0 ? `${notice.length} Issue(s) Found` : 'No issues Found'}
            </Text>
        </>
    );
}


ReceiptAudit.PropTypes = propTypes;
ReceiptAudit.defaultProps = defaultProps;
ReceiptAudit.displayName = 'ReceiptAudit';

export default ReceiptAudit;
