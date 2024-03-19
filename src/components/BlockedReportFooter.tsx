import React from 'react';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import Banner from './Banner';

function ArchivedReportFooter() {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    const text = 'Note: You have been banned from communicating in this channel';

    return (
        <Banner
            containerStyles={[styles.archivedReportFooter]}
            text={text}
            shouldShowIcon
        />
    );
}

ArchivedReportFooter.displayName = 'ArchivedReportFooter';

export default ArchivedReportFooter;
