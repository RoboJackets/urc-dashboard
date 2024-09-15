
import "./header.css"
import logo from "./assets/robojacketsLogo.jpg"

export default function Header() {


    return <>
    
        <div className="rootContainer">
            <div className="logoWithImage">
            <img className="logo" src={logo} width={40} height={40} alt="Italian Trulli"/>                <p className="text1">ROBONAV</p>
            </div>
            <p className="titleText">WALL-I Dashboard</p>
            <div className="connectionStatus">
                <p className="roverText">Rover : </p>
                <p className="connectionText">Disconnected</p>
            </div>
            

        </div>

    </>
}