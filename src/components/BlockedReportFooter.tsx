import React from 'react';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import Banner from './Banner';

function BlockedReportFooter() {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

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
