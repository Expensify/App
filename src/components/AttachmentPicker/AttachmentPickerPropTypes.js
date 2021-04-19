import PropTypes from 'prop-types';

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

    // A function to execute when the attachment picker modal is closed
    onModalHide: PropTypes.func,
};

const defaultProps = {
    onModalHide: () => {},
};


export {propTypes, defaultProps};
