import {AmpPlugin, easepick, LockPlugin, RangePlugin, TimePlugin} from '@easepick/bundle';
import {createSignal, For, onMount, Show} from "solid-js";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js"
import duration from "dayjs/plugin/duration.js"
import customParseFormat from "dayjs/plugin/customParseFormat.js"
import TimePicker from "./timePicker.component";
import axios from "axios"
import {A, useNavigate} from "@solidjs/router";
import fileDownload from "js-file-download";
import Papa from "papaparse"
import {Alert, Button, Container, Form, Table} from "solid-bootstrap";
import {SolidQuill} from "solid-quill";
import {createMutable} from "solid-js/store";

dayjs.extend(utc)
dayjs.extend(duration)
dayjs.extend(customParseFormat)

export default function Configuration() {
    const [message, setMessage] = createSignal(null)
    const [instructions, setInstructions] = createSignal("")
    const format = "DD.MM.YYYY HH:mm"
    const [appointments, setAppointments] = createSignal([])
    const navigate = useNavigate()
    const appointment = createMutable({ breaks: [], volume: 1, length: 60, start: '', end: '', name: "", instructions: "" })
    let q;

    const init = (quill) => {
        console.assert(q.getText() === quill.getText());
    };

    function createBearer() {
        return {headers: {Authorization: `Bearer ${localStorage.getItem('token')}`}}
    }

    onMount(async () => {
        const boundsSelector = new easepick.create({
            element: "#duration",
            css: ['https://cdn.jsdelivr.net/npm/@easepick/bundle@1.2.0/dist/index.css'],
            autoApply: false,
            plugins: [RangePlugin, LockPlugin, TimePlugin, AmpPlugin],
            format,
            LockPlugin: { minDate: dayjs().toISOString() },
            zIndex: 20
        })

        boundsSelector.on('select', e => {
            appointment.start = e.detail.start
            appointment.end = e.detail.end
        })

        boundsSelector.setStartTime('8:00')
        boundsSelector.setEndTime('16:00')

        await getAppointments()
    })

    async function getAppointments() {
        try {
            const response = await axios.get('/api/appointment', createBearer())
            setAppointments(response.data)
        } catch(e) {
            navigate('/login', {replace: true})
        }
    }

    function addBreak() {
        appointment.breaks.push({
            start: '12:00',
            end: '13:00'
        })
    }

    function formatTime(time) {
        return dayjs(time, 'HH:mm').utc().format('HH:mm:ss')
    }

    async function createAppointment() {
        const payload = {
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
            await axios.post("api/appointment", payload, createBearer())
        } catch(e) {
            if(e.response.status === 401) {
                navigate('/login', {replace: true})
            }
            else {
                setMessage({color: 'danger', text: "couldn't create appointment, try again"})
            }
        }

        await getAppointments()

    }

    async function deleteAppointment(id) {
        try {
            await axios.delete(`api/appointment/${id}`, createBearer())
            await getAppointments()
        } catch(e) {
            if(e.response.status=== 401) {
                navigate('/login', {replace: true})
            }
        }
    }

    async function downloadReservations(id, name) {
        try {
            const response = await axios.get(`/api/appointment/${id}/reservations`, {...createBearer()})
            console.log(response.data)
            const pretty = response.data.map(reservation => ({
                ...reservation,
                start: dayjs(reservation.start).format(format),
                end: dayjs(reservation.end).format(format),
                cancelUrl: `${window.location.protocol}//${window.location.hostname}/cancel/${reservation.cancelUrl}`
            }))
            fileDownload(Papa.unparse(pretty), `${name}.csv`)
        } catch(e) {
            if(e.response.status=== 401) {
                navigate('/login', {replace: true})
            }
            else {
                setMessage({color: 'danger', text: "couldn't download reservations"})
            }
        }
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
                <Form.Control type="number" value={appointment.volume} step="1" min="1" onChange={e => appointment.volume = parseInt(e.currentTarget.value)} id="volume"/>
            </Form.Group>
            <Form.Group>
                <Form.Label for="length">Session length in minutes</Form.Label>
                <Form.Control type="number" step="1" min="1" name="Session Length" value={appointment.length} onChange={e => appointment.length = parseFloat(e.currentTarget.value)} id="length"/>
            </Form.Group>
            <Form.Group>
                <Form.Label>Availability</Form.Label>
                <Form.Group>
                    <Form.Label>Date</Form.Label>
                    <Form.Control id="duration" style="width: 300px; background-color: initial"/>
                </Form.Group>
            </Form.Group>
            <div class="mb-3">
                <h2>Breaks</h2>
                <Button class="mb-3" variant="secondary" onClick={() => addBreak()}>Add break</Button>
                <For each={appointment.breaks}>{(breakData, i) =>
                    <Form.Group>
                        <TimePicker name="Start" model={breakData.start}/>&nbsp;
                        <TimePicker name="End" model={breakData.end}/>
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
        <Button onClick={createAppointment}>Create Appointment</Button>

        <h1>Appointments</h1>
        <Table>
            <thead>
            <tr>
                <th>Name</th>
                <th>Start</th>
                <th>End</th>
                <th>Reserved</th>
                <th>Capacity</th>
                <th>Link</th>
                <th>Reservations</th>
            </tr>
            </thead>
            <tbody>
            <For each={appointments()}>{(appointment, i) =>
                <tr>
                    <td>{appointment.name}</td>
                    <td>{dayjs(appointment.start).format(format)}</td>
                    <td>{dayjs(appointment.end).format(format)}</td>
                    <td>{appointment.reserved}</td>
                    <td>{appointment.capacity}</td>
                    <td><A href={`/reserve/${appointment.id}`} target="_blank">link</A></td>
                    <td><A onClick={() => downloadReservations(appointment.id, appointment.name)} href="">Download</A></td>
                    <td><A href={`/appointment/${appointment.id}`}>Edit</A></td>
                    <td><Button variant="danger" onClick={() => deleteAppointment(appointment.id)}>Delete</Button></td>
                </tr>
            }</For>
            </tbody>
        </Table>
    </Container>
}