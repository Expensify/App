import _ from 'underscore';
import ONYXKEYS from '../../ONYXKEYS';
import * as API from '../API';

function removeDuplicatesByKey(array, key) {
    if (!array || !Array.isArray(array)) return [];
    const seen = new Set();
    return array.filter(item => {
        if (!item || !item[key]) return false;
        const keyValue = item[key];
        if (seen.has(keyValue)) {
            console.log('[Onboarding] Removing duplicate with ' + key + '=' + keyValue);
            return false;
        }
        seen.add(keyValue);
        return true;
    });
}

function fetchOnboardingTasks() {
    return (dispatch, getState) => {
        const lastFetchTime = getState().onboarding.lastFetchTime;
        const currentTime = Date.now();
        if (lastFetchTime && (currentTime - lastFetchTime < 300000)) {
            console.log('[Onboarding] Tasks recently fetched, skipping');
            return;
        }
        
        API.get('/api/onboarding/tasks').then((response) => {
            if (!response || !response.tasks) return;
            const uniqueTasks = removeDuplicatesByKey(response.tasks, 'id');
            console.log('[Onboarding] Received ' + response.tasks.length + ' tasks, ' + uniqueTasks.length + ' unique');
            dispatch({
                type: 'SET_ONBOARDING_TASKS',
                tasks: uniqueTasks,
                lastFetchTime: currentTime
            });
        }).catch((error) => {
            console.error('[Onboarding] Failed to fetch tasks:', error);
        });
    };
}

export { fetchOnboardingTasks, removeDuplicatesByKey };