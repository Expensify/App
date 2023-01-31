import React from 'react';
import CONST from '../../CONST';
import {propTypes, defaultProps} from './attachmentPickerPropTypes';
import * as FileUtils from '../../libs/fileDownload/FileUtils';

/**
 * Returns acceptable FileTypes based on ATTACHMENT_PICKER_TYPE
 * @param {String} type
 * @returns {String|undefined} Picker will accept all file types when its undefined
 */
function getAcceptableFileTypes(type) {
    if (type !== CONST.ATTACHMENT_PICKER_TYPE.IMAGE) {
        return;
    }

    return 'image/*';
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
                        let file = e.target.files[0];

                        if (file) {
                            const cleanName = FileUtils.cleanFileName(file.name);
                            file.uri = URL.createObjectURL(file);
                            if (file.name !== cleanName) {
                                file = new File([file], cleanName);
                            }
                            this.onPicked(file);
                        }

                        // Cleanup after selecting a file to start from a fresh state
                        this.fileInput.value = null;
                    }}

                    // We are stopping the event propagation because triggering the `click()` on the hidden input
                    // causes the event to unexpectedly bubble up to anything wrapping this component e.g. Pressable
                    onClick={e => e.stopPropagation()}
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

AttachmentPicker.propTypes = propTypes;
AttachmentPicker.defaultProps = defaultProps;
export default AttachmentPicker;
