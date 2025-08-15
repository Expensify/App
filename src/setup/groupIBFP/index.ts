import GroupIBFPUtils from '@libs/GroupIBFPUtils';

export default function initGroupIB(): Promise<any | undefined> {
    return GroupIBFPUtils.init();
}

initGroupIB();
