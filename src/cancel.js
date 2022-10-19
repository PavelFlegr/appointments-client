import {createSignal, Show} from "solid-js";
import axios from "axios";
import {useParams} from "@solidjs/router";
import {Alert, Button, Container} from "solid-bootstrap";

export default function Cancel() {
    const params = useParams()
    const [cancelled, setCancelled] = createSignal(false)

    async function cancelReservation() {
        await axios.delete(`/api/reservation/${params.reservationId}`)
        setCancelled(true)
    }

    return <Container class="text-center">
        <Show when={cancelled()} fallback={<Button variant="danger" onClick={()=> cancelReservation()}>Confirm reservation cancel</Button>}>
            <Alert variant="success">Reservation cancelled</Alert>
        </Show>
    </Container>
}