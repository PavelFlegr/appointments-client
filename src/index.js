import { render } from "solid-js/web";
import { Routes, Route, Router } from "@solidjs/router"
import Reservation from "./reservation";
import Configuration from "./configuration";
import Cancel from "./cancel";

function App() {
    return (
        <Routes>
            <Route path="/reserve/:appointmentId" component={Reservation}/>
            <Route path="/configuration" component={Configuration} />
            <Route path="/cancel/:reservationId" component={Cancel}/>
        </Routes>
    );
}

render(() => <Router><App /></Router>, document.getElementById("app"));
