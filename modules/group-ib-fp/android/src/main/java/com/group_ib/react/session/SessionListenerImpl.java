package main.java.com.group_ib.react.session;

import com.group_ib.sdk.SessionListener;

public final class SessionListenerImpl implements SessionListener {
    
    private final SessionEvents events;

    public SessionListenerImpl(final SessionEvents events) {
        this.events = events;
    }
    
    @Override
    public void onSessionOpened(final String cfids) {
        events.emit(SessionEvents.EVENT_SESSION_OPENED, cfids);
    }

    @Override
    public void onReceiveSession(final String cfids) {
        SessionListener.super.onReceiveSession(cfids);
        events.emit(SessionEvents.EVENT_RECEIVE_SESSION, cfids);
    }
}