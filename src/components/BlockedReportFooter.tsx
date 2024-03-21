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
            containerStyles={[styles.archivedReportFooter]}
            text={text}
            shouldShowIcon
        />
    );
}

BlockedReportFooter.displayName = 'ArchivedReportFooter';

export default BlockedReportFooter;
