import React from 'react';
import * as Expensicons from '@components/Icon/Expensicons';
import MenuItem from '@components/MenuItem';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

function DownloadMenuItem({download}: {download?: () => void}) {
    const themeStyles = useThemeStyles();
    const {translate} = useLocalize();
    return (
        <MenuItem
            isAnonymousAction
            title={translate('common.download')}
            icon={Expensicons.Download}
            onPress={download}
            wrapperStyle={themeStyles.sectionMenuItemTopDescription}
        />
    );
}

DownloadMenuItem.displayName = 'DownloadMenuItem';

export default DownloadMenuItem;
