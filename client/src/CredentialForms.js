import { useState, useEffect} from "react";
import './InputForm.css'

function Form(props){
    const [inputs, setInputs] = useState({});

    const [inputsPlaceHolder, setInputsPlaceHolder] = useState({})
  
    const [status, setStatus] = useState("No Connection");
  
    const handleChange = (event) => {
      const name = event.target.name;
      const value = event.target.value;
      setInputs(values => ({...values, [name]: value}))
    }
  
    const eraseInputs = () => {
      setInputs({});
    }
  
    const handleSubmit = (event) => {
      event.preventDefault();
      
      const form = event.target;
      const data = new FormData(form);
      var data2send = {};
      for(let id of [...data]){
        console.log("Form :", id[0], id[1])
        data2send[id[0]] = id[1];
        setInputsPlaceHolder(values => ({...values, [id[0]]: id[1]}))
      }
      console.log(data2send)
      fetch('/api/fiix/form', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(data2send)
      })
      const timer = setTimeout(() => {
        fetch("/api/fiix/status")
        .then((res) => res.json())
        .then((data) => setStatus(data.status));
      }, 5000);
      eraseInputs();
    }
  
    useEffect(() => {
      fetch("/api/fiix/status")
      .then((res) => res.json())
      .then((data) => {
        setStatus(data.status);
        Object.entries(data).forEach((elem, index) => {
          console.log(data)
          if(index !== 0){
            setInputsPlaceHolder(values => ({...values, [elem[0]]: elem[1]}))
          }
        })
      });
      const interval = setInterval(() => {
        fetch("/api/fiix/status")
        .then((res) => res.json())
        .then((data) => {setStatus(data.status); props.setStatus(data.status)});
      }, 15000);
      return () => clearInterval(interval);
    },[]);
    
  
  
    return (
      // <form onSubmit={handleSubmit} action="/form">
      <form onSubmit={handleSubmit}>
        <label for="BaseURI"> Enter BaseURI: </label><br/>
        <input 
          id="BaseURI"
          className="InputForm"
          type="text" 
          name="BaseURI" 
          value={inputs.BaseURI || ""} 
          onChange={handleChange}
          placeholder={inputsPlaceHolder.BaseURI || ""} 
          required
        /><br/>
        <label for="APPKey">Enter APPKey: </label><br/>
          <input 
            id="APPKey"
            className="InputForm"
            type="text" 
            name="APPKey" 
            value={inputs.APPKey || ""} 
            onChange={handleChange}
            placeholder={inputsPlaceHolder.APPKey || ""} 
            required
          /><br/>
        <label for="AuthToken">Enter AuthToken: </label><br/>
          <input 
            id="AuthToken"
            className="InputForm"
            type="text" 
            name="AuthToken" 
            value={inputs.AuthToken || ""} 
            onChange={handleChange}
            placeholder={inputsPlaceHolder.AuthToken || ""} 
            required
          /><br/>
        <label for="PKey">Enter PKey: </label><br/>
          <input function
            id="PKey"
            className="InputForm"
            type="text" 
            name="PKey" 
            value={inputs.PKey || ""} 
            onChange={handleChange}
            placeholder={inputsPlaceHolder.PKey || ""} 
            required
          /><br/>
          {/* <h5 style={{width: "50%", margin: 0 }}> Connection {status}</h5> */}
          <div style={{"margin-top":"20px", height:"40px"}}>
          Status : 
          <label for="sub" style={{verticalAlign: "baseline", color: status === 'No Connection' ? 'red' : 'green'}} > {status} </label>
          <input id="sub" className="submitForm" type="submit"/>
          </div>
      </form>
    )
  }
  
  export default Form;