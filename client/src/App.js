import { useState } from "react";
import ReactDOM from "react-dom";

function App() {
  const [inputs, setInputs] = useState({});

  const handleChange = (event) => {
    const name = event.target.name;
    const value = event.target.value;
    setInputs(values => ({...values, [name]: value}))
  }

  const handleSubmit = (event) => {
    event.preventDefault();
    alert(inputs);
  }

  return (
    // <form onSubmit={handleSubmit} action="/form">
    <form action="/form">
      <label for="BaseURI"> Enter BaseURI: </label><br/>
      <input 
        id="BaseURI"
        type="text" 
        name="BaseURI" 
        value={inputs.BaseURI || ""} 
        onChange={handleChange}
      /><br/>
      <label for="APPKey">Enter APPKey: </label><br/>
        <input 
          id="APPKey"
          type="text" 
          name="APPKey" 
          value={inputs.APPKey || ""} 
          onChange={handleChange}
        /><br/>
      <label for="AuthToken">Enter AuthToken: </label><br/>
        <input 
          id="AuthToken"
          type="text" 
          name="AuthToken" 
          value={inputs.AuthToken || ""} 
          onChange={handleChange}
        /><br/>
      <label for="PKey">Enter PKey: </label><br/>
        <input 
          id="PKey"
          type="text" 
          name="PKey" 
          value={inputs.PKey || ""} 
          onChange={handleChange}
        /><br/>
        <input type="submit" />
    </form>
  )
}


export default App; 
