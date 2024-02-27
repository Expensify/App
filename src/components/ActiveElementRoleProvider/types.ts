import type {ValueOf} from 'type-fest';
import type CONST from '@src/CONST';

type AriaRole = ValueOf<typeof CONST.ROLE>;

type ActiveElementRoleContextValue = {
    role: AriaRole | null;
};

type ActiveElementRoleProps = {
    children: React.ReactNode;
};

export type {AriaRole, ActiveElementRoleContextValue, ActiveElementRoleProps};
