import {isSafari} from "@libs/Browser";
import type ChildrenProps from "@src/types/utils/ChildrenProps";

type SafariFormWrapperProps = ChildrenProps;

function SafariFormWrapper({children}: SafariFormWrapperProps) {
    if (isSafari()) {
        return <form>{children}</form>;
    }

   return <>{children}</>;
}

export default SafariFormWrapper;
