import {AmpPlugin, easepick, LockPlugin, RangePlugin, TimePlugin} from '@easepick/bundle';
import {createSignal, onMount} from "solid-js";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js"
import duration from "dayjs/plugin/duration.js"
import TimePicker from "./timePicker.component";
import axios from "axios"

dayjs.extend(utc)
dayjs.extend(duration)

export default function Configuration() {
    const [breaks, setBreaks] = createSignal([])
    const [volume, setVolume] = createSignal(1)
    const [length, setLength] = createSignal("01:00")
    const [bounds, setBounds] = createSignal({})
    const [name, setName] = createSignal("")
    const format = "DD.MM.YYYY HH:mm"
    const [appointments, setAppointments] = createSignal([])

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

        const response = await axios.get('/api/appointment')

        setAppointments(response.data)
    })

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

    async function createAppointment() {
        const [h, m] = length().split(":")
        console.log(dayjs.duration({h, m}))
        const appointment = {
            name: name(),
            volume: volume(),
            length: dayjs.duration({h, m}),
            start: dayjs(bounds().start).utc().toISOString(),
            end: dayjs(bounds().end).utc().toISOString(),
            breaks: breaks().map(breakData => ({start: breakData.start.time(), end: breakData.end.time()})),
            exclude: []
        }

        await axios.post("api/appointment", appointment)

    }

    return <>
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
            <button onClick={addBreak}>Add break</button>
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
            <For each={appointments()}>{(appointment, i) =>
                <tr>
                    <td>{appointment.name}</td>
                    <td><a href={`/reserve/${appointment.id}`}>link</a></td>
                </tr>
            }</For>
        </table>
    </>
}