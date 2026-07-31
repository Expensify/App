import useReportActionAvatars from '@components/ReportActionAvatars/useReportActionAvatars';
import Text from '@components/Text';

import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';

import {getDelegateAccountIDFromReportAction, getHumanAgentAccountIDFromReportAction, getManagerOnVacation, getVacationer} from '@libs/ReportActionsUtils';

import CONST from '@src/CONST';
import type * as OnyxTypes from '@src/types/onyx';

import type {OnyxEntry} from 'react-native-onyx';

import React from 'react';
import {View} from 'react-native';

import DelegateOnBehalfOfText from './DelegateOnBehalfOfText';
import HumanAgentAssistedByText from './HumanAgentAssistedByText';
import VacationDelegateText from './VacationDelegateText';

type ReportActionItemSystemProps = {
    /** Action content. */
    children: React.ReactNode;

    /** All the data of the action item. */
    action: OnyxTypes.ReportAction;

    /** Report for this action. */
    report: OnyxEntry<OnyxTypes.Report>;

    /** The IOU/Expense report associated with the action. */
    iouReport?: OnyxTypes.Report;

    /** Whether the avatar resolver should attribute automatic actions to their real actor. */
    shouldUseRealActor: boolean;
};

function ReportActionItemSystem({children, action, report, iouReport, shouldUseRealActor}: ReportActionItemSystemProps) {
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const {avatarType, avatars, details, reportPreviewSenderID} = useReportActionAvatars({report: iouReport ?? report, action, shouldUseRealActor});
    const [primaryAvatar, secondaryAvatar] = avatars;
    const delegateAccountID = getDelegateAccountIDFromReportAction(action);
    const humanAgentAccountID = getHumanAgentAccountIDFromReportAction(action);
    const mainAccountID = delegateAccountID ? (reportPreviewSenderID ?? iouReport?.ownerAccountID ?? action.childOwnerAccountID) : undefined;
    const hasVacationDelegate = !!getVacationer(action) || !!getManagerOnVacation(action);
    const fallbackActorName = action.person
        ?.map((fragment) => fragment.text)
        .filter(Boolean)
        .join(' ');
    const avatarActorName = avatarType === CONST.REPORT_ACTION_AVATARS.TYPE.MULTIPLE ? `${primaryAvatar.name} & ${secondaryAvatar.name}` : primaryAvatar.name;
    const actorName = avatarActorName?.length ? avatarActorName : fallbackActorName;

    return (
        <View style={[styles.flexRow, styles.flexWrap, StyleUtils.getCompactContentContainerStyles()]}>
            {!!actorName && <Text style={[styles.chatItemMessage, styles.colorMuted]}>{`${actorName} `}</Text>}
            {!!delegateAccountID && (
                <View style={styles.mr1}>
                    <DelegateOnBehalfOfText
                        mainAccountID={mainAccountID}
                        fallbackLogin={details.login}
                    />
                </View>
            )}
            {!!humanAgentAccountID && (
                <View style={styles.mr1}>
                    <HumanAgentAssistedByText action={action} />
                </View>
            )}
            {hasVacationDelegate && (
                <View style={styles.mr1}>
                    <VacationDelegateText action={action} />
                </View>
            )}
            <View style={styles.flexShrink1}>{children}</View>
        </View>
    );
}

export default ReportActionItemSystem;
