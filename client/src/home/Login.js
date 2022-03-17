import './Login.css'
import { useState, useEffect} from "react";
import logo from './logo1.jpeg'
import { useNavigate } from 'react-router-dom';


function Login(props){

    const [inputs, setInputs] = useState({});

    const navigate = useNavigate();

    const handleSubmit = (event) => {
        event.preventDefault();
        fetch('/api/login', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({username: inputs.username, password: inputs.password})
          })
          .then((res) => res.json())
          .then((data) => {
              console.log(data)
            if(data.result){
                props.handler(data.company);
                navigate('/home')
            }
          });
    }
    
    const handleChange = (event) => {
        const name = event.target.name;
        const value = event.target.value;
        setInputs(values => ({...values, [name]: value}))
      }

    return(
        <>
        <form onSubmit={handleSubmit} >
            <div className="box">
                <img src={logo} alt="360 Ingenieria"/>
                <h1>Machine Integration Login</h1>
                <input className="username" name="username" type="text" placeholder="User Name" onChange={handleChange} value={inputs.username || ""} required />
                <input className="username" name="password" type="password" placeholder="Password" onChange={handleChange} value={inputs.password || ""} required/>
                <input className="buttonLogin" type="submit"/>
            </div>
        </form>
        </>
    )
}

export default Login;