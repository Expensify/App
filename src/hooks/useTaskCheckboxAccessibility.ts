import {useState} from 'react';
import Accessibility from '@libs/Accessibility';
import shouldBreakAccessibilityGrouping from '@libs/shouldBreakAccessibilityGrouping';
import useAccessibilityAnnouncement from './useAccessibilityAnnouncement';
import useLocalize from './useLocalize';

function useTaskCheckboxAccessibility(isCompletedFromOnyx: boolean, taskTitlePlainText: string) {
    const {translate} = useLocalize();
    const isScreenReaderActive = Accessibility.useScreenReaderStatus();
    const shouldBreakGrouping = shouldBreakAccessibilityGrouping();
    const shouldSplitTaskAccessibilityTargets = shouldBreakGrouping && isScreenReaderActive;

    // Local state provides immediate feedback for VoiceOver after toggling the checkbox,
    // since Onyx updates asynchronously and the screen reader would announce the stale state.
    const [prevIsCompletedFromOnyx, setPrevIsCompletedFromOnyx] = useState(isCompletedFromOnyx);
    const [localIsCompleted, setLocalIsCompleted] = useState(isCompletedFromOnyx);
    const [taskCheckboxAnnouncement, setTaskCheckboxAnnouncement] = useState<{message: string; key: number}>();

    if (prevIsCompletedFromOnyx !== isCompletedFromOnyx) {
        setPrevIsCompletedFromOnyx(isCompletedFromOnyx);
        setLocalIsCompleted(isCompletedFromOnyx);
    }

    const isCompleted = shouldSplitTaskAccessibilityTargets ? localIsCompleted : isCompletedFromOnyx;
    const shouldAnnounceTaskCheckboxState = shouldSplitTaskAccessibilityTargets && !!taskCheckboxAnnouncement;

    useAccessibilityAnnouncement(taskCheckboxAnnouncement?.message ?? '', shouldAnnounceTaskCheckboxState, {announcementKey: taskCheckboxAnnouncement?.key});

    const taskAccessibilityLabel = taskTitlePlainText ? `${translate('task.task')}: ${taskTitlePlainText}` : translate('task.task');
    const taskCheckboxAccessibilityLabel = shouldSplitTaskAccessibilityTargets ? translate('task.task') : taskAccessibilityLabel;
    const taskCheckboxAccessibilityHint = shouldSplitTaskAccessibilityTargets && taskTitlePlainText ? taskTitlePlainText : undefined;
    // NativeGenericPressable falls back to accessibilityLabel when hint is undefined. Use an empty string to avoid
    // duplicating the full task title as a hint on the title pressable, since its label already includes the title.
    const titlePressableAccessibilityHint = shouldSplitTaskAccessibilityTargets ? '' : undefined;

    const updateTaskCheckboxStateForAccessibility = (currentIsCompleted: boolean) => {
        if (!shouldSplitTaskAccessibilityTargets) {
            return;
        }

        const willBeCompleted = !currentIsCompleted;
        setLocalIsCompleted(willBeCompleted);
        setTaskCheckboxAnnouncement((currentAnnouncement) => ({
            message: willBeCompleted ? translate('task.messages.completed') : translate('task.messages.reopened'),
            key: (currentAnnouncement?.key ?? 0) + 1,
        }));
    };

    return {
        isCompleted,
        shouldSplitTaskAccessibilityTargets,
        taskAccessibilityLabel,
        taskCheckboxAccessibilityLabel,
        taskCheckboxAccessibilityHint,
        titlePressableAccessibilityHint,
        updateTaskCheckboxStateForAccessibility,
    };
}

export default useTaskCheckboxAccessibility;
