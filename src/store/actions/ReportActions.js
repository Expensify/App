/* globals moment */
import * as Store from '../Store';
import {request, delayedWrite} from '../../lib/Network';
import STOREKEYS from '../STOREKEYS';
import ExpensiMark from '../../lib/ExpensiMark';
import Guid from '../../lib/Guid';

/**
 * Get all of our reports
 */
function fetchAll() {
    request('Get', {
        returnValueList: 'reportListBeta',
        sortBy: 'starred',
        offset: 0,
        limit: 10,
    }).done((data) => {
        Store.set(STOREKEYS.REPORTS, data.reportListBeta);
    });
}

/**
 * Get a single report
 */
function fetch(reportID) {
    request('Get', {
        returnValueList: 'reportStuff',
        reportIDList: reportID,
        shouldLoadOptionalKeys: true,
    }).done((data) => {
        Store.set(`${STOREKEYS.REPORT}_${reportID}`, data.reports[reportID]);
    });
}

/**
 * Get the comments of a report
 */
function fetchComments(reportID) {
    request('Report_GetHistory', {
        reportID: reportID,
        offset: 0,
    }).done((data) => {
        const sortedData = data.history.sort(
            (a, b) => a.sequenceNumber - b.sequenceNumber,
        );
        Store.set(`${STOREKEYS.REPORT}_${reportID}_comments`, sortedData);
    });
}

/**
 * Add a comment to a report
 * @param {string} reportID
 * @param {string} commentText
 */
function addComment(reportID, commentText) {
    const messageParser = new ExpensiMark();
    const comments = Store.get(`${STOREKEYS.REPORT}_${reportID}_comments`);
    const newSequenceNumber =
        comments.length === 0
            ? 1
            : comments[comments.length - 1].sequenceNumber + 1;
    const guid = Guid();

    // Optimistically add the new comment to the store before waiting to save it to the server
    Store.set(`${STOREKEYS.REPORT}_${reportID}_comments`, [
        ...comments,
        {
            tempGuid: guid,
            actionName: 'ADDCOMMENT',
            actorEmail: Store.get(STOREKEYS.SESSION, 'email'),
            person: [
                {
                    style: 'strong',
                    text: '',
                    // text: this.props.userDisplayName,
                    type: 'TEXT',
                },
            ],
            automatic: false,
            sequenceNumber: newSequenceNumber,
            avatar: '',
            // avatar: this.props.userAvatar,
            timestamp: moment.unix(),
            message: [
                {
                    type: 'COMMENT',
                    html: messageParser.replace(commentText),
                    text: commentText,
                },
            ],
            isFirstItem: false,
            isAttachmentPlaceHolder: false,
        },
    ]);

    delayedWrite('Report_AddComment', {
        reportID: reportID,
        reportComment: commentText,
    }).done(() => {
        // When the delayed write is finished, we find the optimistic comment that was added to the store
        // and remove it's tempGuid because we know it's been written to the server
        const comments =
            Store.get(`${STOREKEYS.REPORT}_${reportID}_comments`) || [];
        Store.set(
            `${STOREKEYS.REPORT}_${reportID}_comments`,
            comments.map((comment) => {
                if (comment.tempGuid && comment.tempGuid === guid) {
                    return {
                        ...comment,
                        tempGuid: null,
                    };
                }
                return comment;
            }),
        );
    });
}

export {fetchAll, fetch, fetchComments, addComment};
