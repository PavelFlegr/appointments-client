import axios from "axios";
import {createSignal, Show} from "solid-js";
import {A, useNavigate} from "@solidjs/router";
import {Alert, Button, Col, Container, Form, Row} from "solid-bootstrap";

export default function Register() {
    const [email, setEmail] = createSignal('')
    const [password, setPassword] = createSignal('')
    const [verifyPassword, setVerifyPassword] = createSignal('')
    const [message, setMessage] = createSignal(null)
    const navigate = useNavigate()

    async function register() {
        try {
            const result = await axios.post('/api/register', {
                password: password(),
                email: email(),
                verifyPassword: verifyPassword()
            })
            if(result.data) {
                navigate('/login', {replace: true})
            }
        } catch (e) {
            setMessage({color: 'danger', text: "couldn't register, please try again"})
        }
    }

    return <Container style="max-width:400px" >
        <Show when={message()}>
            <Alert class="text-center" variant={message().color}>
                {message().text}
            </Alert>
        </Show>
        <h1 class="text-center">Register</h1>
        <Form>
            <Form.Group as={Row} class="mb-3">
                <Form.Label column sm={5}>Email</Form.Label>
                <Col>
                    <Form.Control value={email()} onInput={(e) => setEmail(e.currentTarget.value)} type='email'/>
                </Col>
            </Form.Group>
            <Form.Group as={Row} class="mb-3">
                <Form.Label column sm={5}>Password</Form.Label>
                <Col>
                    <Form.Control value={password()} onInput={e => setPassword(e.currentTarget.value)} type='password'/>
                </Col>
            </Form.Group>
            <Form.Group as={Row} class="mb-3">
                <Form.Label column sm={5}>Verify Password</Form.Label>
                <Col>
                    <Form.Control value={verifyPassword()} onInput={e => setVerifyPassword(e.currentTarget.value)} type='password'/>
                </Col>
            </Form.Group>
            <Form.Group class="text-center" >
                <Button class="me-3" onClick={() => register()}>Register</Button>
                <A href="/login">Login instead</A>
            </Form.Group>
        </Form>
    </Container>
}