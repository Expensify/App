import type * as OnyxCommon from '@src/types/onyx/OnyxCommon';

import type {StyleProp, TextStyle} from 'react-native';

type ReportActionItemMessageHeaderSenderProps = {
    /** Text to display */
    fragmentText: string | undefined;

    /** Users accountID */
    accountID: number;

    /** Should this fragment be contained in a single line? */
    isSingleLine?: boolean;

    /** The accountID of the copilot who took this action on behalf of the user */
    delegateAccountID?: number;

    /** Actor icon */
    actorIcon?: OnyxCommon.Icon;

    /** Whether the fragment should show a tooltip */
    shouldShowTooltip?: boolean;

    /** Additional typography style for temporary system-message comparisons. */
    style?: StyleProp<TextStyle>;
};

export default ReportActionItemMessageHeaderSenderProps;
