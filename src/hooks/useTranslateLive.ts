import {useEffect} from 'react';
import Onyx, {useOnyx} from 'react-native-onyx';
import type {OnyxEntry} from 'react-native-onyx';
import {makeRequestWithSideEffects} from '@libs/API';
import ONYXKEYS from '@src/ONYXKEYS';
import type {ReportAction} from '@src/types/onyx';
import useLocalize from './useLocalize';

export default function useTranslateLive(reportID: string | undefined, reportAction: OnyxEntry<ReportAction>) {
    const {preferredLocale} = useLocalize();
    const [session] = useOnyx(ONYXKEYS.SESSION);
    const [isAutoTranslateMessagesEnabled] = useOnyx(ONYXKEYS.NVP_AUTO_TRANSLATE_MESSAGES);

    useEffect(() => {
        if (!reportID || !reportAction?.message) {
            return;
        }

        if (reportAction.actorAccountID === session?.accountID) {
            return;
        }

        if (reportAction.message?.length > 1) {
            return;
        }

        if (!reportAction.message[0]?.html) {
            return;
        }

        const fragment = reportAction.message[0];
        if (!isAutoTranslateMessagesEnabled) {
            console.log('over here 1')
            if (!fragment.translatedText) {
                return;
            }
            console.log('over here 2')
            Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`, {
                [reportAction.reportActionID]: {
                    message: [{...reportAction?.message[0], translatedText: null}],
                },
            });
            console.log('over here 3')
            return;
        }
        console.log('over here 4')
        makeRequestWithSideEffects('Translate', {
            type: 'live',
            textToTranslate: fragment?.html,
            targetLanguage: preferredLocale,
        }).then((response) => {
            Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`, {
                [reportAction.reportActionID]: {
                    message: [{...reportAction?.message[0], translatedText: response.translation}],
                },
            });
        });
    }, [reportID, reportAction.reportActionID]);
}
