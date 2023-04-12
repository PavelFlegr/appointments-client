import {onMount} from "solid-js";
import {Form} from "solid-bootstrap";
import {AmpPlugin, easepick, LockPlugin, RangePlugin, TimePlugin} from "@easepick/bundle";
import dayjs from "dayjs";

export default function DateRange(props) {
    let model = props.model
    let disabled = props.disabled ?? false
    let input
    let bounds
    let onChange = props.onChange ?? (() => {})
    const format = "DD.MM.YYYY HH:mm"

    onMount(async () => {
        bounds = new easepick.create({
            element: input,
            css: ['https://cdn.jsdelivr.net/npm/@easepick/bundle@1.2.0/dist/index.css'],
            autoApply: false,
            plugins: [RangePlugin, LockPlugin, TimePlugin, AmpPlugin],
            format,
            LockPlugin: { minDate: dayjs().toISOString() },
            zIndex: 20
        })

        if(props.value) {
            bounds.setDateRange(props.value.start, props.value.end)
        }

        bounds.on('select', e => {
            onChange(e.detail)
        })

        bounds.setStartTime('8:00')
        bounds.setEndTime('16:00')
    })

    return <Form.Control ref={input} disabled={disabled} style={`width: 300px; ${ disabled ? '' : 'background-color: initial'}`}/>
}