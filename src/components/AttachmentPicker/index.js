import React from 'react';
import PropTypes from 'prop-types';

const propTypes = {
    children: PropTypes.func.isRequired,
};

/**
 * This component renders a function as a child and
 * returns a "show attachment picker" method that takes
 * a callback. This is the web/mWeb/desktop version since
 * on iOS Safari we must append a hidden input to the DOM
 * and listen to onChange event. When the show method is
 * called an attachment
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
 */
class AttachmentPicker extends React.Component {
    render() {
        return (
            <>
                <input
                    hidden
                    type="file"
                    ref={el => this.fileInput = el}
                    onChange={(e) => {
                        const file = e.target.files[0];
                        file.uri = URL.createObjectURL(file);
                        this.onPicked(file);
                    }}
                />
                {this.props.children({
                    openPicker: ({onPicked}) => {
                        this.onPicked = onPicked;
                        this.fileInput.click();
                    },
                })}
            </>
        );
    }
}

AttachmentPicker.propTypes = propTypes;
export default AttachmentPicker;
