import {onMount} from "solid-js";

export default function TimePicker(props) {
    let input

    onMount(() => {
        $(input).clockTimePicker({
            alwaysSelectHoursFirst: true,
            autoSize: true,
        })
    })

    return <>
        <label>{props.name}</label>
        <input value={props.model.time()} onChange={(e) => props.model.setTime(e.currentTarget.value)} ref={input}/>
    </>
}