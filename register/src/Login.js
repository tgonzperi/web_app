import './Login.css'
import { useState, useEffect} from "react";


function Login(props){

    const [inputs, setInputs] = useState({});

    const handleSubmit = (event) => {
        event.preventDefault();
        if(inputs.username === 'admin' && inputs.password === 'Sbq4504'){
            props.handler()
        }
    }
    
    const handleChange = (event) => {
        const name = event.target.name;
        const value = event.target.value;
        setInputs(values => ({...values, [name]: value}))
      }

    return(
        <>
        <form onSubmit={handleSubmit} >
            <div class="box">
                <h1>Login Form</h1>
                <input className="username" name="username" type="text" placeholder="User Name" onChange={handleChange} value={inputs.username || ""} required />
                <input className="username" name="password" type="password" placeholder="Password" onChange={handleChange} value={inputs.password || ""} required/>
                <input className="buttonLogin" type="submit"/>
            </div>
        </form>
        </>
    )
}

export default Login;