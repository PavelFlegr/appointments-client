import {AmpPlugin, easepick, LockPlugin, RangePlugin, TimePlugin} from '@easepick/bundle';
import {createSignal, For, onMount, Show} from "solid-js";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js"
import duration from "dayjs/plugin/duration.js"
import customParseFormat from "dayjs/plugin/customParseFormat.js"
import TimePicker from "./timePicker.component";
import axios from "axios"
import {useNavigate} from "@solidjs/router";

dayjs.extend(utc)
dayjs.extend(duration)
dayjs.extend(customParseFormat)

export default function Configuration() {
    const [breaks, setBreaks] = createSignal([])
    const [volume, setVolume] = createSignal(1)
    const [length, setLength] = createSignal("01:00")
    const [bounds, setBounds] = createSignal({})
    const [name, setName] = createSignal("")
    const [message, setMessage] = createSignal(null)
    const format = "DD.MM.YYYY HH:mm"
    const [appointments, setAppointments] = createSignal([])
    const navigate = useNavigate()

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
            TimePlugin: { stepMinutes: 1 },
            LockPlugin: { minDate: dayjs().toISOString() },
            zIndex: 20
        })

        boundsSelector.on('select', e => {
            setBounds(e.detail)
        })

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
        const [breakStart, setBreakStart] = createSignal("12:00")
        const [breakEnd, setBreakEnd] = createSignal("13:00")
        setBreaks([...breaks(), {
            start: {
                time: breakStart,
                setTime: setBreakStart,
            },
            end: {
                time: breakEnd,
                setTime: setBreakEnd,
            },
        }])
    }

    function formatTime(time) {
        return dayjs(time, 'HH:mm').utc().format('HH:mm:ss')
    }

    async function createAppointment() {
        const [h, m] = length().split(":")
        const appointment = {
            name: name(),
            volume: volume(),
            length: dayjs.duration({h, m}),
            start: dayjs(bounds().start).utc().toISOString(),
            end: dayjs(bounds().end).utc().toISOString(),
            breaks: breaks().map(breakData => ({start: formatTime(breakData.start.time()), end: formatTime(breakData.end.time())})),
            exclude: []
        }

        try {
            await axios.post("api/appointment", appointment, createBearer())
        } catch(e) {
            if(e.response.status === 401) {
                navigate('/login', {replace: true})
            }
            else {
                setMessage({color: 'darkred', text: "couldn't create appointment, try again"})
            }
        }

        await getAppointments()

    }

    async function deleteAppointment(id) {
        try {
            await axios.delete(`api/appointment/${id}`, createBearer())
            await getAppointments()
        } catch(e) {
            console.log(e)
            if(e.response.status=== 401) {
                navigate('/login', {replace: true})
            }
        }
    }

    return <>
        <Show when={message()}>
            <div style={`background-color: ${message().color}`}>
                {message().text}
            </div>
        </Show>
        <label for="name">Appointment Name</label>
        <input value={name()} onChange={e => setName(e.currentTarget.value)} id="name"/>
        <label for="volume">Available spots per session</label>
        <input type="number" value={volume()} step="1" min="1" onChange={e => setVolume(parseInt(e.currentTarget.value))} id="volume"/>
        <div>
            <TimePicker name="Session Length" model={{time: length, setTime: setLength}}/>
        </div>
        <label for="duration">Select total duration</label>
        <input id="duration"/>
        <div>
            <h2>Breaks</h2>
            <button onClick={() => addBreak()}>Add break</button>
            <For each={breaks()}>{(breakData, i) =>
                <div>
                    <TimePicker name="Start" model={breakData.start}/>
                    <TimePicker name="End" model={breakData.end}/>
                </div>
            }</For>
        </div>
        <button onClick={createAppointment}>Create Appointment</button>

        <h1>Appointments</h1>
        <table>
            <thead>
            <tr>
                <th>name</th>
                <th>start</th>
                <th>end</th>
                <th>link</th>
            </tr>
            </thead>
            <tbody>
            <For each={appointments()}>{(appointment, i) =>
                <tr>
                    <td>{appointment.name}</td>
                    <td>{dayjs(appointment.start).format(format)}</td>
                    <td>{dayjs(appointment.end).format(format)}</td>
                    <td><a href={`/reserve/${appointment.id}`} target="_blank">link</a></td>
                    <td><button onClick={() => deleteAppointment(appointment.id)}>Delete</button></td>
                </tr>
            }</For>
            </tbody>
        </table>
    </>
}