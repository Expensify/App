import type TabBarShapeProbeProps from './types';

/** Only the iOS tab bar can be laid out as a column, so elsewhere there is no shape to read. */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function TabBarShapeProbe(_props: TabBarShapeProbeProps) {
    return null;
}

export default TabBarShapeProbe;
