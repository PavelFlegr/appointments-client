import {useParams} from "@solidjs/router";
import {createSignal, For, onMount, Show} from "solid-js";
import timezone from "dayjs/plugin/timezone.js"
import axios from "axios";
import dayjs from "dayjs";
import {Alert, Button, Card, Col, Container, Form, Modal, Row } from "solid-bootstrap";
dayjs.extend(timezone)


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
    const [free, setFree] = createSignal(null)
    const [total, setTotal] = createSignal(null)
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
        setFree(result.data.free)
        setTotal(result.data.total)
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
                email: email(),
                timezone: dayjs.tz.guess(),
            })

            setMessage({color: "success", text: "reservation created"})
        } catch(e) {
            setMessage({color: "danger", text: "reservation failed, please try again"})
        } finally {
            await loadSegments()
            setShowConfirmation(false)
        }
    }

    return <Container class="text-center">
        <Show when={message()}>
            <Alert variant={message().color}>
                {message().text}
            </Alert>
        </Show>
        <h1>Make a reservation for {appointmentName()} ({free()}/{total()} spots available)</h1>
        <Show when={groupedSegments().length} fallback={<Alert variant="info">Sorry, there are no more dates avalaible</Alert>}>
            <For each={groupedSegments()}>{(group, i) =>
                <>
                    <h2>{dayjs(group.date).format('DD.MM.YYYY')}</h2>
                    <div style="display: flex; justify-content: center; flex-wrap: wrap">
                        <For each={group.segments}>{(segment, i) =>
                            <Card border={segment.volume === 0 ?  "secondary" : "primary"} class="m-2" style={{ width: "14rem" }}>
                                <Card.Header>
                                    Spots Left: {segment.volume}
                                </Card.Header>
                                <Card.Body>
                                    <Card.Title>
                                        {dayjs(segment.start).format("HH:mm")} - {dayjs(segment.end).format("HH:mm")}
                                    </Card.Title>
                                    <Button disabled={segment.volume === 0} onClick={() => confirmReservation(segment)}>Reserve</Button>
                                </Card.Body>
                            </Card>
                        }</For>
                    </div>
                </>
            }</For>
        </Show>

        <Modal show={showConfirmation()} onHide={()=>setShowConfirmation(false)}>
            <Modal.Header closeButton>
                <Modal.Title>Finish reservation</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form>
                    <Form.Group as={Row} class="mb-3">
                        <Form.Label column sm={3}>Date</Form.Label>
                        <Col>
                            <Form.Control disabled value={dayjs(selected().start).format('DD.MM.YYYY')} type="text"></Form.Control>
                        </Col>
                    </Form.Group>
                    <Form.Group as={Row} class="mb-3">
                        <Form.Label column sm={3}>Time</Form.Label>
                        <Col>
                            <Form.Control disabled value={`${dayjs(selected().start).format("HH:mm")} - ${dayjs(selected().end).format("HH:mm")}`} type="text"></Form.Control>
                        </Col>
                    </Form.Group>
                    <Form.Group as={Row} class="mb-3">
                        <Form.Label column sm={3}>First Name</Form.Label>
                        <Col>
                            <Form.Control value={firstName()} onChange={e=>setFirstName(e.currentTarget.value)} type="text"></Form.Control>
                        </Col>
                    </Form.Group>
                    <Form.Group as={Row} class="mb-3">
                        <Form.Label column sm={3}>Last Name</Form.Label>
                        <Col>
                            <Form.Control value={lastName()} onChange={e=>setLastName(e.currentTarget.value)} type="text"></Form.Control>
                        </Col>
                    </Form.Group>
                    <Form.Group as={Row} class="mb-3">
                        <Form.Label column sm={3}>Email</Form.Label>
                        <Col>
                            <Form.Control value={email()} onChange={e=>setEmail(e.currentTarget.value)} type="email"></Form.Control>
                            <Form.Text> you will receive a confirmation on this address</Form.Text>
                        </Col>
                    </Form.Group>
                </Form>
            </Modal.Body>
            <Modal.Footer>
                <Button onClick={finishReservation} type="submit">Confirm Reservation</Button>
                <Button variant="secondary" onClick={() => setShowConfirmation(false)}>Cancel</Button>
            </Modal.Footer>
        </Modal>
    </Container>
}