import useReportActionAvatars from '@components/ReportActionAvatars/useReportActionAvatars';
import Text from '@components/Text';

import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';

import {getDelegateAccountIDFromReportAction, getHumanAgentAccountIDFromReportAction, getManagerOnVacation, getVacationer} from '@libs/ReportActionsUtils';

import CONST from '@src/CONST';

import React from 'react';
import {View} from 'react-native';

import type {ReportActionItemContentWrapperProps, ReportActionItemProps} from './ReportActionItem';

import DelegateOnBehalfOfText from './DelegateOnBehalfOfText';
import HumanAgentAssistedByText from './HumanAgentAssistedByText';
import ReportActionItem from './ReportActionItem';
import ReportActionItemDate from './ReportActionItemDate';
import VacationDelegateText from './VacationDelegateText';

function ReportActionItemSystemContent({children, action, report, iouReport, shouldUseRealActor}: ReportActionItemContentWrapperProps) {
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
        <View style={styles.flexShrink1}>
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
            <ReportActionItemDate created={action.created ?? ''} />
        </View>
    );
}

type ReportActionItemSystemProps = Omit<ReportActionItemProps, 'actionContentWrapper'>;

function ReportActionItemSystem(props: ReportActionItemSystemProps) {
    return (
        <ReportActionItem
            {...props}
            actionContentWrapper={ReportActionItemSystemContent}
        />
    );
}

export default ReportActionItemSystem;
export {ReportActionItemSystemContent};
