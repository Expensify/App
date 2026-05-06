import SubBase from './Sub';
import SubContent from './SubContent';
import SubTrigger from './SubTrigger';

// Compound members so consumers write `<Sub.Trigger>` / `<Sub.Content>` rather than flat `<SubTrigger>` exports.
const Sub = Object.assign(SubBase, {Trigger: SubTrigger, Content: SubContent});

export {Sub};
export type {SubProps} from './Sub';
export type {SubTriggerProps} from './SubTrigger';
export type {SubContentProps} from './SubContent';
export {useIsAtActiveLevel} from './SubContext';
