import axios from "axios";
import {createSignal, Show} from "solid-js";
import {A, useNavigate} from "@solidjs/router";

export default function Login() {
    const [email, setEmail] = createSignal('')
    const [password, setPassword] = createSignal('')
    const [message, setMessage] = createSignal(null)
    const navigate = useNavigate()

    async function login() {
        const result = await axios.post('/api/login', {password: password(), email: email()})
        if(result.data) {
            localStorage.setItem('token', result.data.token)
            navigate('/', {replace: true})
        }
        else {
            setMessage({color: 'darkred', text: "couldn't login, please try again"})
        }
    }

    return <div>
        <Show when={message()}>
            <div style={`background-color: ${message().color}`}>
                {message().text}
            </div>
        </Show>
        <div>
            <label>Email</label>
            <input value={email()} onInput={(e) => setEmail(e.currentTarget.value)} type='email'/>
        </div>
        <div>
            <label>Password</label>
            <input value={password()} onInput={e => setPassword(e.currentTarget.value)} type='password'/>
        </div>
        <button onClick={() => login()}>Login</button>
        <A href="/register">Register</A>
    </div>
}