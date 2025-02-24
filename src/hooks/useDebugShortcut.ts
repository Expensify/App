import {useEffect} from 'react';
import KeyboardShortcut from '@libs/KeyboardShortcut';
import toggleTestToolsModal from '@userActions/TestTool';
import CONST from '@src/CONST';

function useDebugShortcut() {
    useEffect(() => {
        const debugShortcutConfig = CONST.KEYBOARD_SHORTCUTS.DEBUG;
        const unsubscribeDebugShortcut = KeyboardShortcut.subscribe(
            debugShortcutConfig.shortcutKey,
            () => toggleTestToolsModal(),
            debugShortcutConfig.descriptionKey,
            debugShortcutConfig.modifiers,
            true,
        );

        return () => {
            unsubscribeDebugShortcut();
        };

        // Rule disabled because this effect is only for component did mount & will component unmount lifecycle event
        // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps
    }, []);
}

export default useDebugShortcut;
