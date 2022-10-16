import {createSignal, Show} from "solid-js";
import axios from "axios";
import {useParams} from "@solidjs/router";

export default function Cancel() {
    const params = useParams()
    const [cancelled, setCancelled] = createSignal(false)

    async function cancelReservation() {
        await axios.delete(`/api/reservation/${params.reservationId}`)
        setCancelled(true)
    }

    return <Show when={cancelled()} fallback={<button onClick={()=> cancelReservation()}>Confirm reservation cancel</button>}>
        Reservation cancelled
    </Show>
}