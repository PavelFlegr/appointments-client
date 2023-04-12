import {onMount} from "solid-js";
import {Form} from "solid-bootstrap";

export default function TimePicker(props) {
    let disabled = props.disabled ?? false
    let input
    let onChange = props.onChange ?? (() => {})

    onMount(() => {
        $(input).clockTimePicker({
            alwaysSelectHoursFirst: true,
            autoSize: true,
        })
    })

    return <>
        <Form.Label>{props.name}</Form.Label>&nbsp;
        <Form.Control value={props.value} disabled={disabled} style="width: 100px" onChange={(e) => onChange(e.currentTarget.value)} ref={input}/>
    </>
}