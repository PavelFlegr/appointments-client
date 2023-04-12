import { render } from "solid-js/web";
import { Routes, Route, Router } from "@solidjs/router"
import Reservation from "./reservation";
import Configuration from "./configuration";
import Cancel from "./cancel";
import Login from "./login";
import Register from "./register";
import Appointment from "./appointment";

function App() {
    return (
        <Routes>
            <Route path="/reserve/:appointmentId" component={Reservation}/>
            <Route path="/cancel/:reservationId" component={Cancel}/>
            <Route path="/login" component={Login}/>
            <Route path="/register" component={Register}/>
            <Route path="/" component={Configuration}/>
            <Route path="/appointment/:appointmentId" component={Appointment}></Route>
        </Routes>
    );
}

render(() => <Router><App /></Router>, document.getElementById("app"));
