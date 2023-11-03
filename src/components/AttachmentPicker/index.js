import React, {useRef} from 'react';
import Visibility from '@libs/Visibility';
import CONST from '@src/CONST';
import {defaultProps, propTypes} from './attachmentPickerPropTypes';

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
 * @param {propTypes} props
 * @returns {JSX.Element}
 */
function AttachmentPicker(props) {
    const fileInput = useRef();
    const onPicked = useRef();
    const onCanceled = useRef(() => {});

    return (
        <>
            <input
                hidden
                type="file"
                ref={fileInput}
                onChange={(e) => {
                    const file = e.target.files[0];

                    if (file) {
                        file.uri = URL.createObjectURL(file);
                        onPicked.current(file);
                    }

                    // Cleanup after selecting a file to start from a fresh state
                    fileInput.current.value = null;
                }}
                // We are stopping the event propagation because triggering the `click()` on the hidden input
                // causes the event to unexpectedly bubble up to anything wrapping this component e.g. Pressable
                onClick={(e) => {
                    e.stopPropagation();
                    if (!fileInput.current) {
                        return;
                    }
                    fileInput.current.addEventListener(
                        'cancel',
                        () => {
                            // For Android Chrome, the cancel event happens before the page is visible on physical devices,
                            // which makes it unreliable for us to show the keyboard, while on emulators it happens after the page is visible.
                            // So here we can delay calling the onCanceled.current function based on visibility in order to reliably show the keyboard.
                            if (Visibility.isVisible()) {
                                onCanceled.current();
                                return;
                            }
                            const unsubscribeVisibilityListener = Visibility.onVisibilityChange(() => {
                                onCanceled.current();
                                unsubscribeVisibilityListener();
                            });
                        },
                        {once: true},
                    );
                }}
                accept={getAcceptableFileTypes(props.type)}
            />
            {props.children({
                openPicker: ({onPicked: newOnPicked, onCanceled: newOnCanceled = () => {}}) => {
                    onPicked.current = newOnPicked;
                    fileInput.current.click();
                    onCanceled.current = newOnCanceled;
                },
            })}
        </>
    );
}

AttachmentPicker.propTypes = propTypes;
AttachmentPicker.defaultProps = defaultProps;
export default AttachmentPicker;
