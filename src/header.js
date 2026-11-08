import "./header.css";
import logo from "./assets/robojacketsLogo.jpg";
import { StopButton } from "./components/StopButton/StopButton";
import { LinkHealth } from "./components/LinkHealth/LinkHealth";
import { Preflight } from "./components/Preflight/Preflight";

export default function Header() {
    return (
        <>
            <div className="rootContainer">
                <div className="logoWithImage">
                    <img
                        className="logo"
                        src={logo}
                        width={40}
                        height={40}
                        alt="Italian Trulli"
                    />
                    <p className="text1">ROBONAV</p>
                </div>
                <p className="titleText">WALL-I Dashboard</p>
                <div className="headerControls">
                    <LinkHealth />
                    <Preflight />
                    <StopButton />
                </div>
            </div>
        </>
    );
}
