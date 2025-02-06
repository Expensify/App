import {useMemo} from 'react';
import {useOnyx} from 'react-native-onyx';
import {getDefaultGroupAvatar, getPolicyName, getReportName, getWorkspaceIcon, isGroupChat, isThread} from '@libs/ReportUtils';
import {getFullSizeAvatar} from '@libs/UserUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {AttachmentModalBaseContentProps} from './BaseContent';
import type {AttachmentModalContent} from './types';

const ReportAvatarModalContent: AttachmentModalContent = ({params, children}) => {
    const reportID = params.reportID ?? '-1';
    const policyID = params.policyID ?? '-1';

    const [report] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`);
    const [policy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`);

    const [isLoadingApp] = useOnyx(ONYXKEYS.IS_LOADING_APP, {initialValue: true});

    const attachment = useMemo(() => {
        if (isGroupChat(report) && !isThread(report)) {
            return {
                source: report?.avatarUrl ? getFullSizeAvatar(report.avatarUrl, 0) : getDefaultGroupAvatar(report?.reportID ?? ''),
                headerTitle: getReportName(report),
                isWorkspaceAvatar: false,
            };
        }

        return {
            source: getFullSizeAvatar(getWorkspaceIcon(report).source, 0),
            headerTitle: getPolicyName({report, policy}),
            // In the case of default workspace avatar, originalFileName prop takes policyID as value to get the color of the avatar
            originalFileName: policy?.originalFileName ?? policy?.id ?? report?.policyID ?? '',
            isWorkspaceAvatar: true,
        };
    }, [policy, report]);

    const contentProps = useMemo(
        () =>
            ({
                ...attachment,
                fallbackRoute: ROUTES.REPORT_WITH_ID_DETAILS.getRoute(reportID),
                shouldShowNotFoundPage: !report?.reportID && !isLoadingApp,
                isLoading: (!report?.reportID || !policy?.id) && !!isLoadingApp,
            } satisfies Partial<AttachmentModalBaseContentProps>),
        [attachment, isLoadingApp, policy?.id, report?.reportID, reportID],
    );

    const wrapperProps = useMemo(() => ({}), []);

    // eslint-disable-next-line react-compiler/react-compiler
    return children({contentProps, wrapperProps});
};

export default ReportAvatarModalContent;
