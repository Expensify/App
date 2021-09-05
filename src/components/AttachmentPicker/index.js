import React from 'react';
import CONST from '../../CONST';
import * as attachmentPickerPropTypes from './AttachmentPickerPropTypes';

/**
 * Returns acceptable FileTypes based on ATTACHMENT_PICKER_TYPE
 * @param {String} type
 * @returns {String} file types string
 */
function getAcceptableFileTypes(type) {
    if (type === CONST.ATTACHMENT_PICKER_TYPE.IMAGE) {
        return 'image/*';
    }

    // Accept all file types when its undefined
    return undefined;
}

/**
 * This component renders a function as a child and
 * returns a "show attachment picker" method that takes
 * a callback. This is the web/mWeb/desktop version since
 * on a Browser we must append a hidden input to the DOM
 * and listen to onChange event.
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

                        if (file) {
                            file.uri = URL.createObjectURL(file);
                            this.onPicked(file);
                        }

                        // Cleanup after selecting a file to start from a fresh state
                        this.fileInput.value = null;
                    }}
                    accept={getAcceptableFileTypes(this.props.type)}
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

AttachmentPicker.propTypes = attachmentPickerPropTypes.propTypes;
AttachmentPicker.defaultProps = attachmentPickerPropTypes.defaultProps;
export default AttachmentPicker;
