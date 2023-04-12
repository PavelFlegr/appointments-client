import {onMount} from "solid-js";
import {Form} from "solid-bootstrap";

export default function TimePicker(props) {
    let model = props.model
    let disabled = props.disabled ?? false
    let input

    onMount(() => {
        $(input).clockTimePicker({
            alwaysSelectHoursFirst: true,
            autoSize: true,
        })
    })

    return <>
        <Form.Label>{props.name}</Form.Label>&nbsp;
        <Form.Control disabled={disabled} style="width: 100px" value={props.model} onChange={(e) => props.model = e.currentTarget.value} ref={input}/>
    </>
}