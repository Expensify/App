import Button from '@components/Button';
import PopoverMenu from '@components/PopoverMenu';

import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import usePopoverPosition from '@hooks/usePopoverPosition';

import {isSafari} from '@libs/Browser';

import {close} from '@userActions/Modal';

import CONST from '@src/CONST';
import type {AnchorPosition} from '@src/styles';

import type {ComponentRef} from 'react';

import React, {useRef, useState} from 'react';
import {View} from 'react-native';

/** A kind of document a file can be labelled with */
type FileTypeOption = {
    /** The key saved with the file */
    value: string;

    /** The name shown to the user */
    label: string;
};

type FileTypeMenuButtonProps = {
    /** Text of the button */
    buttonText: string;

    /** Read out by screen readers in place of the button text */
    accessibilityLabel: string;

    /** The kinds of document to pick from */
    types: FileTypeOption[];

    /** Called with the picked kind once the menu is closed, so it can open the file picker */
    onSelect: (fileType: string) => void;
};

const ANCHOR_ALIGNMENT = {horizontal: CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.LEFT, vertical: CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.TOP};

/** A button that asks which kind of document to upload: a menu under the button on wide screens, a sheet from the bottom on narrow ones */
function FileTypeMenuButton({buttonText, accessibilityLabel, types, onSelect}: FileTypeMenuButtonProps) {
    const {translate} = useLocalize();
    const icons = useMemoizedLazyExpensifyIcons(['Document']);
    const {calculatePopoverPosition} = usePopoverPosition();
    const anchorRef = useRef<ComponentRef<typeof View>>(null);
    const [anchorPosition, setAnchorPosition] = useState<AnchorPosition>();
    const [isMenuVisible, setIsMenuVisible] = useState(false);

    const openMenu = () => {
        calculatePopoverPosition(anchorRef, ANCHOR_ALIGNMENT).then((position) => {
            setAnchorPosition(position);
            setIsMenuVisible(true);
        });
    };

    return (
        <>
            <View
                ref={anchorRef}
                collapsable={false}
            >
                <Button
                    sentryLabel={CONST.SENTRY_LABEL.UPLOAD_FILE.UPLOAD_BUTTON}
                    accessibilityLabel={accessibilityLabel}
                    onPress={openMenu}
                >
                    <Button.Text>{buttonText}</Button.Text>
                </Button>
            </View>
            {!!anchorPosition && (
                <PopoverMenu
                    isVisible={isMenuVisible}
                    onClose={() => setIsMenuVisible(false)}
                    anchorPosition={anchorPosition}
                    anchorAlignment={ANCHOR_ALIGNMENT}
                    anchorRef={anchorRef}
                    headerText={translate('dynamicForm.selectDocumentToUpload')}
                    menuItems={types.map((type) => ({key: type.value, text: type.label, icon: icons.Document}))}
                    onItemSelected={(item) => {
                        setIsMenuVisible(false);
                        const fileType = item.key;
                        if (!fileType) {
                            return;
                        }
                        // Safari opens the file picker only from the handler of the user's tap, and the other browsers only once the menu is gone
                        if (isSafari()) {
                            onSelect(fileType);
                            return;
                        }
                        close(() => onSelect(fileType));
                    }}
                    enableEdgeToEdgeBottomSafeAreaPadding
                />
            )}
        </>
    );
}

export default FileTypeMenuButton;
export type {FileTypeOption};
