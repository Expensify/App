import type * as OnyxCommon from '@src/types/onyx/OnyxCommon';

type ReportActionItemMessageHeaderSenderProps = {
    fragmentText: string | undefined;
    accountID: number;

    /** Should this fragment be contained in a single line? */
    isSingleLine?: boolean;

    /** The accountID of the copilot who took this action on behalf of the user */
    delegateAccountID?: number;

    actorIcon?: OnyxCommon.Icon;

    /** Whether the fragment should show a tooltip */
    shouldShowTooltip?: boolean;
};

export default ReportActionItemMessageHeaderSenderProps;
