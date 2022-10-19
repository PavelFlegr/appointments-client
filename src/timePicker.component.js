import {onMount} from "solid-js";
import {Form, FormGroup} from "solid-bootstrap";

export default function TimePicker(props) {
    let input

    onMount(() => {
        $(input).clockTimePicker({
            alwaysSelectHoursFirst: true,
            autoSize: true,
        })
    })

    return <>
        <Form.Label>{props.name}</Form.Label>&nbsp;
        <Form.Control style="width: 100px" value={props.model.time()} onChange={(e) => props.model.setTime(e.currentTarget.value)} ref={input}/>
    </>
}