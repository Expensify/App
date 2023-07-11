import PropTypes from 'prop-types';
import CONST from '../../CONST';

const propTypes = {
    /**
     * A renderProp with the following interface
     *
     * @example
     * <AttachmentPicker>
     * {({openPicker}) => (
     *     <Button
     *         onPress={() => {
     *             openPicker({
     *                 onPicked: (file) => {
     *                     // Display or upload File
     *                 },
     *             });
     *         }}
     *     />
     * )}
     * </AttachmentPicker>
     * */
    children: PropTypes.func.isRequired,

    /** The types of files that can be selected with this picker. */
    type: PropTypes.oneOf([CONST.ATTACHMENT_PICKER_TYPE.FILE, CONST.ATTACHMENT_PICKER_TYPE.IMAGE]),

    /** Optional callback to fire when we want to do something once the modal is hidden. */
    onModalHide: PropTypes.func,
};

const defaultProps = {
    type: CONST.ATTACHMENT_PICKER_TYPE.FILE,
    onModalHide: () => {},
};

export {propTypes, defaultProps};
