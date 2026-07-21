import AvatarWithDisplayName from '@components/AvatarWithDisplayName';

import type {Report} from '@src/types/onyx';

import type {OnyxEntry} from 'react-native-onyx';

type HeaderReportAvatarProps = {
    /** Report we're showing the details for, used by AvatarWithDisplayName. */
    report?: OnyxEntry<Report>;

    /** Whether we should display the status of the report. */
    shouldDisplayStatus?: boolean;

    /** Whether we should enable detail page navigation. */
    shouldEnableDetailPageNavigation?: boolean;

    /** Whether to open the parent report link in the current tab if possible. */
    openParentReportInCurrentTab?: boolean;
};

function HeaderReportAvatar({report, shouldDisplayStatus, shouldEnableDetailPageNavigation = false, openParentReportInCurrentTab = false}: HeaderReportAvatarProps) {
    return (
        <AvatarWithDisplayName
            report={report}
            shouldDisplayStatus={shouldDisplayStatus}
            shouldEnableDetailPageNavigation={shouldEnableDetailPageNavigation}
            openParentReportInCurrentTab={openParentReportInCurrentTab}
        />
    );
}

export default HeaderReportAvatar;
export type {HeaderReportAvatarProps};
