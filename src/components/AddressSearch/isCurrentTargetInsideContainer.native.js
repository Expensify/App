function isCurrentTargetInsideContainer() {
    // The related target check is not required here because in native there is no race condition rendering like on the web
    return false;
}

export default isCurrentTargetInsideContainer;
