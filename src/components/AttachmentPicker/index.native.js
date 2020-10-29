import PropTypes from 'prop-types';
import AttachmentPickerNative from '../../libs/AttachmentPickerNative';

const propTypes = {
    children: PropTypes.func.isRequired,
};

const AttachmentPicker = ({children}) => children({
    show: (callback) => {
        AttachmentPickerNative.show((response) => {
            callback(AttachmentPickerNative.getDataForUpload(response));
        });
    },
});

AttachmentPicker.propTypes = propTypes;
AttachmentPicker.displayName = 'AttachmentPicker';
export default AttachmentPicker;
