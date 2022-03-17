import { useState, useRef, useEffect} from "react";
import { useNavigate } from 'react-router-dom';


import './App.css'


function Register(){

    const [rows, setRows] = useState([]);
    const [inputs, setInputs] = useState({})

    const navigate = useNavigate();

    const handleChange = (event) => {
      const name = event.target.name;
      var value = event.target.value;
      setInputs(values => ({...values, [name]: value}));
    }

    const stateRef = useRef();

    stateRef.current = rows;

    useEffect(()=> {
      fetch('/api/register/fetch', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
      })
      .then((res)=> res.json())
      .then((data)=> {
        var newRow = []
        console.log(data)
        data.forEach(element => {
          newRow.push({
            company: element.Company, component: <tr>
              <td>{element.Company}</td>
              <td>{element.Username}</td>
              <td>{element.Password}</td>
              <td><button style={{padding:"2px 0px"}} name={element.Company} onClick = {removeLine}>Delete</button></td>
            </tr>
          })
        });
        setRows(newRow);
      })
    },[])

    const eraseInputs = (event) => {
      setInputs({});
    }

    const removeLine = (e) => {
      const name = e.target.getAttribute("name");

      var data2send = {company: name};
  
      fetch('/api/register/rm', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(data2send)
      });
      setRows(stateRef.current.filter((list) => (list.company !== name)));
    }

    const addLine = () => {
      if(typeof inputs.Company === 'undefined' || typeof inputs.Username === 'undefined' || typeof inputs.Password === 'undefined'){
        alert('Company, username and password are required')
      }else if(stateRef.current.filter((elem) => elem.company === inputs.Company).length === 0){
        var data2send = inputs;
  
  
        fetch('/api/register/add', {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify(data2send)
        });

        setRows(oldRows => [...oldRows, {company: inputs.Company, component: <tr>
          <td>{inputs.Company}</td>
          <td>{inputs.Username}</td>
          <td>{inputs.Password}</td>
          <td><button style={{padding:"2px 0px"}} name={inputs.Company} onClick = {removeLine}>Delete</button></td>
        </tr>}]);
      
      eraseInputs();
      }else{
        alert('Company already in list')
      }
    }

    const removeAll = () => {
      fetch('/api/register/rm_all', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'}
      });
    }

    const returnToMain = () => {
      navigate('/')
    }
    return(
        <>
        <table>
          <tr>
            <th>Company Name</th>
            <th>Username</th>
            <th>Password</th>
            <th></th>
          </tr>
          {rows.map((element) => element.component)}
          <tr>
          <td>
        <input
        id="Company"
        className="InputForm"
        name="Company"
        type="text"
        value={inputs.Company || ""}
        onChange={handleChange}
        /> 
        </td>
        <td>
        <input
        id="Username"
        className="InputForm"
        name="Username"
        type="text"
        value={inputs.Username || ""}
        onChange={handleChange}
        /> 
        </td>
        <td>
        <input
        id="Password"
        className="InputForm"
        name="Password"
        type="text"
        value={inputs.Password || ""}
        onChange={handleChange}
        /> 
        </td>
        <th><button name = "addLine" onClick = {addLine}>Add Line</button> </th>
          </tr>
        </table>
         <button onClick= {removeAll}> Remove All</button><br/><br/>
         <a onClick={returnToMain}>Return to Machine Integration Login</a>

        </>
    )
}

export default Register;