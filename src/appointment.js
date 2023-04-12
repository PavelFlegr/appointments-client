import {AmpPlugin, easepick, LockPlugin, RangePlugin, TimePlugin} from '@easepick/bundle';
import {createSignal, For, onMount, Show} from "solid-js";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js"
import duration from "dayjs/plugin/duration.js"
import customParseFormat from "dayjs/plugin/customParseFormat.js"
import TimePicker from "./components/time-picker.component";
import axios from "axios"
import {A, useNavigate, useParams} from "@solidjs/router";
import {Alert, Button, Container, Form} from "solid-bootstrap";
import {SolidQuill} from "solid-quill";
import {createMutable} from "solid-js/store";
import DateRange from "./components/date-range.component";

dayjs.extend(utc)
dayjs.extend(duration)
dayjs.extend(customParseFormat)

export default function Appointment() {
    const params = useParams()
    const [message, setMessage] = createSignal(null)
    const navigate = useNavigate()
    let boundsSelector;

    const appointment = createMutable({ breaks: [], volume: 1, length: 60, bounds: { start: null, end: null }, name: "", instructions: "" })
    let q;

    const init = (quill) => {
        console.assert(q.getText() === quill.getText());
    };

    function createBearer() {
        return {headers: {Authorization: `Bearer ${localStorage.getItem('token')}`}}
    }

    onMount(async () => {
        loadAppointment(params.appointmentId)
    })

    async function loadAppointment(appointmentId) {
        const {data} = await axios.get(`/api/appointment/${appointmentId}`, createBearer())
        appointment.name = data.name
        appointment.length = dayjs.duration(data.length).asMinutes()
        appointment.volume = data.volume
        if(data.instructions) {
            appointment.instructions = data.instructions
        }
        appointment.start = data.start
        appointment.end = data.end
        appointment.breaks = data.breaks.map(breakData => ({start: unformatTime(breakData.start), end: unformatTime(breakData.end)}))
        q.root.innerHTML = data.instructions
    }

    function formatTime(time) {
        return dayjs(time, 'HH:mm').utc().format('HH:mm:ss')
    }

    function unformatTime(time) {
        return dayjs(time, 'HH:mm:ss').utc(true).tz(dayjs.tz.guess()).format('HH:mm')
    }

    async function saveAppointment() {
        const payload = {
            id: params.appointmentId,
            name: appointment.name,
            volume: appointment.volume,
            length: dayjs.duration({m: appointment.length}),
            start: appointment.start,
            end: appointment.end,
            breaks: appointment.breaks.map(breakData => ({start: formatTime(breakData.start), end: formatTime(breakData.end)})),
            exclude: [],
            instructions: appointment.instructions
        }

        try {
            await axios.put("/api/appointment", payload, createBearer())
        } catch(e) {
            if(e.response.status === 401) {
                navigate('/login', {replace: true})
            }
            else {
                setMessage({color: 'danger', text: "couldn't create appointment, try again"})
            }
        }

        navigate('/', {replace: true})
    }

    return <Container>
        <Show when={message()}>
            <Alert variant={message().color}>
                {message().text}
            </Alert>
        </Show>
        <Form style="width: 300px">
            <Form.Group>
                <Form.Label for="name">Appointment Name</Form.Label>
                <Form.Control value={appointment.name} onChange={e => appointment.name = e.currentTarget.value} id="name"/>
            </Form.Group>
            <Form.Group>
                <Form.Label for="volume">Available spots per session</Form.Label>
                <Form.Control type="number" disabled value={appointment.volume} step="1" min="1" onChange={e => appointment.volume = parseInt(e.currentTarget.value)} id="volume"/>
            </Form.Group>
            <Form.Group>
                <Form.Label for="length">Session length in minutes</Form.Label>
                <Form.Control type="number" disabled step="1" min="1" name="Session Length" value={appointment.length} onChange={e => appointment.length = parseFloat(e.currentTarget.value)} id="length"/>
            </Form.Group>
            <Form.Group>
                <Form.Label>Availability</Form.Label>
                <Form.Group>
                    <Form.Label>Date</Form.Label>
                    <DateRange disabled={true} value={appointment.bounds} />
                </Form.Group>
            </Form.Group>
            <div class="mb-3">
                <h2>Breaks</h2>
                <For each={appointment.breaks}>{(breakData, i) =>
                    <Form.Group>
                        <TimePicker disabled={true} name="Start" value={breakData.start}/>&nbsp;
                        <TimePicker disabled={true} name="End" value={breakData.end}/>
                    </Form.Group>
                }</For>
            </div>
        </Form>
        <Form.Group>
            <Form.Label>Email Instructions</Form.Label>
            <SolidQuill
                // Bind the `Quill` instance to the parent
                ref={q}
                // Which element to create (default to `div`)
                as="main"
                // Events
                onReady={init}
                onTextChange={() => appointment.instructions = q.root.innerHTML}
                // Quill options
                debug={false}
                placeholder=""
                style="height: 200px"
                readOnly={false} // for now this is the only reactive props
                theme="snow"
                classList={{ active: true }}
            />
        </Form.Group>
        <Button onClick={saveAppointment}>Save Appointment</Button>
        <A href="/">Cancel</A>
    </Container>
}