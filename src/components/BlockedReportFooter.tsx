import React from 'react';
import {useActionsLocalize} from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import Banner from './Banner';

function BlockedReportFooter() {
    const styles = useThemeStyles();
    const {translate} = useActionsLocalize();

    const text = translate('youHaveBeenBanned');

    return (
        <Banner
            containerStyles={[styles.chatFooterBanner]}
            text={text}
            shouldShowIcon
            shouldRenderHTML
        />
    );
}

export default BlockedReportFooter;
