import { render } from "solid-js/web";
import { Routes, Route, Router } from "@solidjs/router"
import Reservation from "./reservation";
import Configuration from "./configuration";

function App() {
    return (
        <Routes>
            <Route path="/reserve/:appointmentId" component={Reservation}/>
            <Route path="/configuration" component={Configuration} />
        </Routes>
    );
}

render(() => <Router><App /></Router>, document.getElementById("app"));
