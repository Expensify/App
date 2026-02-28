type StatusAnnouncementListener = (message: string) => void;

const listeners = new Set<StatusAnnouncementListener>();

function addStatusAnnouncementListener(listener: StatusAnnouncementListener) {
    listeners.add(listener);

    return () => {
        listeners.delete(listener);
    };
}

function announceStatusForWeb(message: string) {
    for (const listener of listeners) {
        listener(message);
    }
}

export {addStatusAnnouncementListener, announceStatusForWeb};
