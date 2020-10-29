import PropTypes from 'prop-types';
import AttachmentPickerNative from '../../libs/AttachmentPickerNative';

const propTypes = {
    children: PropTypes.func.isRequired,
};

/**
 * This component renders a function as a child and
 * returns a "show attachment picker" method that takes
 * a callback.
 *
 * e.g.
 *
 * <AttachmentPicker>
 *     {({show}) => (
 *         <Button onPress={() => show(someCallback)} />
 *     )}
 * </AttachmentPicker>
 */
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
