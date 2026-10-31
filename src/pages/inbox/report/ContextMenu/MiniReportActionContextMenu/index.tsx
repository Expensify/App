import useThemeStyles from '@hooks/useThemeStyles';

import {useMiniReportActionContextMenuController} from '@pages/inbox/report/ContextMenu/MiniReportActionContextMenuContext';

import viewRef from '@src/types/utils/viewRef';

import React, {useLayoutEffect, useRef, useState} from 'react';
import {View} from 'react-native';

import type MiniReportActionContextMenuProps from './types';

import MiniReportActionContextMenuContent from './MiniReportActionContextMenuContent';

function MiniReportActionContextMenu(props: MiniReportActionContextMenuProps) {
    const controller = useMiniReportActionContextMenuController();
    const styles = useThemeStyles();
    const hostRef = useRef<View | HTMLDivElement | null>(null);
    const token = props.anchor;
    const [shouldUseLocalMenu, setShouldUseLocalMenu] = useState(false);

    useLayoutEffect(() => {
        const host = hostRef.current;
        if (!controller || !token || !host || !('appendChild' in host)) {
            return;
        }
        // The portal's DOM must follow this row before paint, including when its action props change.
        setShouldUseLocalMenu(!controller.attach(token, host, props));
    }, [controller, token, props]);

    useLayoutEffect(
        () => () => {
            if (!token) {
                return;
            }
            controller?.detach(token);
        },
        [controller, token],
    );

    if (!controller || !token) {
        return <MiniReportActionContextMenuContent {...props} />;
    }

    return (
        <View
            ref={viewRef(hostRef)}
            style={styles.dContents}
        >
            {shouldUseLocalMenu && <MiniReportActionContextMenuContent {...props} />}
        </View>
    );
}

export default MiniReportActionContextMenu;
