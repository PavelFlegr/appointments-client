import { render } from "solid-js/web";
import { Routes, Route, Router } from "@solidjs/router"
import Reservation from "./reservation";
import Configuration from "./configuration";
import Cancel from "./cancel";
import Login from "./login";
import {ServiceRegistry} from "solid-services";
import Register from "./register";

function App() {
    return (
        <Routes>
            <Route path="/reserve/:appointmentId" component={Reservation}/>
            <Route path="/cancel/:reservationId" component={Cancel}/>
            <Route path="/login" component={Login}/>
            <Route path="/register" component={Register}/>
            <Route path="/" component={Configuration}/>
        </Routes>
    );
}

render(() => <Router><ServiceRegistry><App /></ServiceRegistry></Router>, document.getElementById("app"));
