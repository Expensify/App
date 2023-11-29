import { useRef, useState } from "react";
import Navigation, {navigationRef} from '@libs/Navigation/Navigation';
import Firebase from '@libs/Firebase'

const removeListener = useRef();

export default function track(): void {
    const [currentScreen, setCurrentScreen] = useState();
    Navigation.isNavigationReady().then(() => {
        // We already have an event listener, we don't need to set it up again.
        if (removeListener.current !== undefined) {
            return;
        }

        // Get initial route
        const initialRoute = navigationRef.current?.getCurrentRoute();
        setCurrentScreen(initialRoute.name);
        Firebase.trackScreen(initialRoute.name);
        removeListener.current = navigationRef.current.addListener('state', (event) => {
            const newScreenName = Navigation.getRouteNameFromStateEvent(event);
            if (newScreenName === currentScreen) {
                return;
            }
            setCurrentScreen(newScreenName);
            Firebase.trackScreen(newScreenName);
        });
    });
}