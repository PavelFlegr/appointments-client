import axios from "axios";
import {createSignal, Show} from "solid-js";
import {A, useNavigate} from "@solidjs/router";

export default function Register() {
    const [email, setEmail] = createSignal('')
    const [password, setPassword] = createSignal('')
    const [verifyPassword, setVerifyPassword] = createSignal('')
    const [message, setMessage] = createSignal(null)
    const navigate = useNavigate()

    async function login() {
        const result = await axios.post('/api/register', {password: password(), email: email(), verifyPassword: verifyPassword()})
        if(result.data) {
            navigate('/login', {replace: true})
        }
        else {
            setMessage({color: 'darkred', text: "couldn't register, please try again"})
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
        <div>
            <label>Verify Password</label>
            <input value={verifyPassword()} onInput={e => setVerifyPassword(e.currentTarget.value)} type='password'/>
        </div>
        <button onClick={() => login()}>Login</button>
        <A href="/login">Login instead</A>
    </div>
}