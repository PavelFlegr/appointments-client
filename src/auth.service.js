import {createSignal} from "solid-js";

export default function AuthService() {
    const [getUser, setUser] = createSignal();

    return {
        get user() {
            return getUser();
        },

        login(token) {
            setUser(user);
        },

        logout() {
            setUser(undefined)
        },
    }
}