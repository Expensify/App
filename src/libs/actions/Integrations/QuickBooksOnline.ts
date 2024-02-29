import { getCommandURL } from '@libs/ApiUtils';
import addEncryptedAuthTokenToURL from '@libs/addEncryptedAuthTokenToURL';
import CONFIG from '@src/CONFIG';

const buildQuickbooksOnlineOAuthJob = function (callbackPath: string, policyID?: string) {
    const queryArguments: Record<string, string> = {
        callbackPath
    };
    if (policyID) {
        queryArguments.targetPolicyID = policyID;
    }

    const queryString = new URLSearchParams(queryArguments).toString();
    const callbackURL = addEncryptedAuthTokenToURL(`${CONFIG.EXPENSIFY.EXPENSIFY_URL}partners/quickbooks/oauthCallbackNewDot?${queryString}`);
    const jobDescription = {
        type: 'OAuthConnect',
        inputSettings: {
            service: 'quickbooksOnline'
        },
        outputSettings: {
            // We need to encode here again because the Integration-server will try to decode here breaking the url:
            // https://github.com/Expensify/Integration-Server/blob/1beea3fd4b0a68083e5ccabe43bda8b98c95d6cd/src/expensify/ExpensifyJob.java#L140-L149
            // callbackURL: encodeURIComponent(callbackURL)
            callbackURL,
        },
        credentials: {
            authToken: null,
        }
    };
    return jobDescription;
};

/**
 * Navigate to a page with POST data
 * Adapted from http://stackoverflow.com/questions/133925/javascript-post-request-like-a-form-submit
 *
 * @param  url The page to POST and navigate to
 * @param  data The POST data to submit
 * @param  blankTarget Whether to submit the form with a 'blank' target (opens a new tab)
 */
// const simulateFormSubmit = (url: string, data: Record<string, unknown>, blankTarget: boolean) => {
//     const target = blankTarget ? 'target="_blank"' : '';
//     const $form = $(`<form method="POST" action="${url}" ${target}></form>`);

//     Object.entries(data).forEach(([key, value]) => {
//         if (!Object.prototype.hasOwnProperty.call(data, key)) {
//             return;
//         }
//         // Create a hidden input that contains the name ane value of the attribute. Make sure to use attr() to
//         // set the 'value' attribute correctly
//         $('<input />').attr({
//             type: 'hidden',
//             name: key,
//             value
//         }).appendTo($form);
//     });

//     $('body').append($form);
//     $form.submit();
// };
/**
 * Run the Quickbooks Online OAuth flow (which will eventually redirect to the policy page once linked)
 *
 * @param callbackPath Where to redirect to once the flow is over, e.g.
 *                     'report?reportID=12345'
 * @param policyID The ID of the policy to associate with this QBO connection if
 *                 authentication succeeds. Only used on first connections.
 */
// const runQuickbooksOnlineOAuthFlow = (callbackPath: string, policyID?: string) => {
//     const jobDescription = buildQuickbooksOnlineOAuthJob(callbackPath, policyID);
//     const postData = {
//         requestJobDescription: JSON.stringify(jobDescription)
//     };

//     simulateFormSubmit(INTEGRATION_SERVER_PROXY, postData);
// };

// const processxxxx () => {
//     qbo_response=
// }
// const processxxxx = (string: policyID, parsedQboResponse) => {
//     const qboIntegration = Policy.getByID(policyID).quickbooksOnlineIntegration;
//     const realmId = qboIntegration.getRealmId();

//     // Make sure the response from the IS was successful
//     QuickbooksOnlineFlows.processIntegrationServerResponse(parsedQboResponse);
//     if (Number(parsedQboResponse.responseCode) !== 200) {
//         return;
//     }

//     // Trigger a sync to make sure that we have data
//     UIUtils.Growl.growl(['Settings', 'PolicyEditor', 'Connections', 'quickbooksOnlineAccountConnected']);
//     PubSub.publish(EVENT.LOADING.START);

//     this.cleanURLAndSync(() => QuickbooksOnline.sync(realmId, policyID).done(() => {
//         // With the new data, make default account selections and sync the connection
//         qboIntegration.reloadData().done(() => {
//             qboIntegration.setDefaultAccountSelections().done(() => {
//                 qboIntegration.syncConnection()
//                     .done(this.setFundamentalChange)
//                     .fail((error) => {
//                         if (_.isUndefined(error.responseCode)) {
//                             PubSub.publish(EVENT.ERROR, {
//                                 tplt: 'quickbooks_online_generic_connect_error',
//                             });
//                             return;
//                         }

//                         // 410 means the user tried to use multi-tagging but doesn't have QBO Classes.
//                         if (Number(error.responseCode) === 410) {
//                             PubSub.publish(EVENT.ERROR, {
//                                 tplt: 'quickbooks_online_multi_tag_no_classes',
//                             });
//                             return;
//                         }

//                         // 411 means the user tried to use multi-tagging but doesn't have QBO Customers.
//                         if (Number(error.responseCode) === 411) {
//                             PubSub.publish(EVENT.ERROR, {
//                                 tplt: 'quickbooks_online_multi_tag_no_customers',
//                             });
//                             return;
//                         }

//                         // If there is an error message, let's just show it to the user as a default.
//                         if (error.responseMessage) {
//                             PubSub.publish(EVENT.ERROR, {
//                                 tplt: 'quickbooks_online_generic_error',
//                                 data: error,
//                             });
//                         }
//                     });
//             }).fail(() => {
//                 PubSub.publish(EVENT.ERROR, {
//                     tplt: 'quickbooks_online_no_account',
//                 });
//             });
//         });
//     }).fail((response) => {
//         QuickbooksOnlineFlows.handleErrorCodes(response, {
//             action: IntegrationServer.RESUMABLE_ACTIONS.SYNC,
//         });
//     }).always(() => {
//         PubSub.publish(EVENT.LOADING.STOP);
//     }));
// },

const getQuickBooksOnlineSetupLink = (policyID: string) => {
    const callbackPath = `https://dev.new.expensify.com:8082/workspace/${policyID}/accounting`;
    // const jobDescription = buildQuickbooksOnlineOAuthJob(callbackPath, policyID);
    // const queryString = new URLSearchParams({requestJobDescription: JSON.stringify(jobDescription)}).toString();
    // const queryString = `requestJobDescription=${encodeURIComponent(JSON.stringify(jobDescription))}`;
    // return `${CONFIG.EXPENSIFY.INTEGRATION_SERVER_PROXY}?${queryString}`;

    const otherParams = new URLSearchParams({callbackPath, policyID}).toString();
    const commandUrl = `${getCommandURL({command: 'ConnectWorkspaceToQuickbooksOnline'})}&${otherParams}`;
    console.log('getQuickBooksOnlineSetupLink commandUrl', commandUrl);
    return commandUrl;
}

export {
    // runQuickbooksOnlineOAuthFlow,
    // eslint-disable-next-line import/prefer-default-export
    getQuickBooksOnlineSetupLink,
};