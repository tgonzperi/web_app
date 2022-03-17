import { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import styles from './style.module.css'
import IdTable from "./IdTable";
import Accordion from "./Accordion";
import Form from "./CredentialForms";
import logo from './logo1.jpeg'
import './App.css'




function App(props) {
  const navigate = useNavigate();
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);
  
  useEffect(()=>{
    console.log("Company : ", props.company)
    fetch('/api/company/fetch', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({company: typeof props.company === 'undefined' ? '' : props.company})
    })
    .then(res => res.json())
    .then ((data) => {
      if(data.length === 0)
        navigate('/login')
      else
        setLoading(false)
    })
  }, [props.company])

return(
  <>
  <div className={styles.mainDiv}>
    {loading ? <> </> : <>
    <Accordion name = {"Fiix Credentials" + (status === "No Connection" ? " (" + status + ")" : "")} children = {<Form setStatus = {setStatus} company = {props.company}/> }  />
    <Accordion name = {"Linortek"} children = {<IdTable idType = {"MacAddress"} company = {props.company}/>} />
    <Accordion name = {"Nettra"} children = {<IdTable idType = {"NettraId"} company = {props.company}/>} />
    </>
    }
  </div>
  </>
)
}


export default App; 