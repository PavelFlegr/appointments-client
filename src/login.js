import axios from "axios";
import {createSignal, Show} from "solid-js";
import { useNavigate} from "@solidjs/router";
import {Alert, Button, Col, Container, Form, Row} from "solid-bootstrap";

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
            setMessage({color: 'danger', text: "couldn't login, please try again"})
        }
    }

    return <Container style="max-width:300px">
        <Show when={message()}>
            <Alert variant={message().color}>
                {message().text}
            </Alert>
        </Show>
        <h1 class="text-center" >Login</h1>
        <Form sm={5}>
            <Form.Group as={Row} class="mb-3">
                <Form.Label column sm={3}>Email</Form.Label>
                <Col>
                    <Form.Control value={email()} onInput={(e) => setEmail(e.currentTarget.value)} type='email'/>
                </Col>
            </Form.Group>
            <Form.Group as={Row} class="mb-3">
                <Form.Label column sm={3}>Password</Form.Label>
                <Col>
                    <Form.Control value={password()} onInput={e => setPassword(e.currentTarget.value)} type='password'/>
                </Col>

            </Form.Group>
            <Form.Group class="text-center" >
                <Button class="me-3" onClick={() => login()}>Login</Button>
                {/*<A href="/register">Register</A>*/}
            </Form.Group>

        </Form>
    </Container>
}