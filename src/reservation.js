import {useParams} from "@solidjs/router";
import {createSignal, For, onMount, Show} from "solid-js";
import axios from "axios";
import dayjs from "dayjs";


export default function Reservation() {
    const params = useParams()

    const [segments, setSegments] =  createSignal([])
    const [showConfirmation, setShowConfirmation] = createSignal(false)
    const [selected, setSelected] = createSignal(null)
    const [firstName, setFirstName] = createSignal("")
    const [lastName, setLastName] = createSignal("")
    const [email, setEmail] = createSignal("")
    const [message, setMessage] = createSignal(null)
    const [appointmentName, setAppointmentName] = createSignal(null)
    const groupedSegments = () => {
        const groups = {}
        segments().forEach(segment => {
            const date = dayjs(segment.start).startOf('day').toISOString()
            if(!groups[date]) {
                groups[date] = []
            }
            groups[date].push(segment)
        })

        return Object.keys(groups).map(date => ({date, segments: groups[date]}))
    }

    async function loadSegments() {
        const result = await axios.get(`/api/segment/${params.appointmentId}`)

        setSegments(result.data.segments)
        setAppointmentName(result.data.appointment)
    }

    onMount(async () => {
        await loadSegments()
    })

    function confirmReservation(segment) {
        setSelected(segment)
        setShowConfirmation(true)
    }

    async function finishReservation() {
        try {
            const result = await axios.post("/api/reservation", {
                segmentId: selected().id,
                firstName: firstName(),
                lastName: lastName(),
                email: email()
            })

            setMessage({color: "darkgreen", text: "reservation created"})
        } catch(e) {
            setMessage({color: "darkred", text: "reservation failed, please try again"})
        } finally {
            await loadSegments()
            setShowConfirmation(false)
        }
    }

    const page = <div>
        <Show when={message()}>
            <div style={`background-color: ${message().color}`}>
                {message().text}
            </div>
        </Show>
        <h1>Make a reservation for {appointmentName()}</h1>
        <For each={groupedSegments()}>{(group, i) =>
        <>
            <h2>{dayjs(group.date).format('DD.MM.YYYY')}</h2>
            <div style="display: flex; flex-wrap: wrap; gap: 10px">
                <For each={group.segments}>{(segment, i) =>
                    <div style="border: 3px outset darkblue; padding: 10px; background-color: #146ebd">
                        <div>
                            {dayjs(segment.start).format("HH:mm")} - {dayjs(segment.end).format("HH:mm")}
                        </div>
                        <div>
                            Spots Left: {segment.volume}
                        </div>
                        <button onClick={() => confirmReservation(segment)}>Reserve</button>
                    </div>
                }</For>
            </div>
        </>
    }</For>
    </div>

    return <Show fallback={page}  when={showConfirmation()}>
        <h3>Finish reservation</h3>
        <div>
            <label>First Name</label>
            <input value={firstName()} onChange={e=>setFirstName(e.currentTarget.value)} type="text"></input>
        </div>
        <div>
            <label>Last Name</label>
            <input value={lastName()} onChange={e=>setLastName(e.currentTarget.value)} type="text"></input>
        </div>
        <div>
            <label>Email</label>
            <input value={email()} onChange={e=>setEmail(e.currentTarget.value)} type="email"></input>
        </div>
        <h4>Reservation</h4>
        <div>{dayjs(selected().start).format('DD.MM.YYYY')}</div>
        <div>{dayjs(selected().start).format("HH:mm")} - {dayjs(selected().end).format("HH:mm")}</div>
        <div>
            <button onClick={finishReservation}>Confirm Reservation</button>
            <button onClick={() => setShowConfirmation(false)}>Cancel</button>
        </div>
    </Show>
}