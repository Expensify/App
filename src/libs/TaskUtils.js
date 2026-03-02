import _ from 'underscore';
import CONST from '../CONST';
import * as Localize from './Localize';

export function getTaskAssignee(taskReport) {
    return taskReport.managerEmail || '';
}

/**
 * Get the full task description without truncation
 * @param {Object} taskReport
 * @returns {String}
 */
export function getTaskDescription(taskReport) {
    if (!taskReport || !taskReport.description) {
        return '';
    }
    
    // Ensure we return the complete description without any truncation
    // The issue seems to be that only the first line is being displayed
    return taskReport.description;
}