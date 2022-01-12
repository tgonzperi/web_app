import { useState } from "react";
import styles from './style.module.css'
import IdTable from "./IdTable";
import Accordion from "./Accordion";
import Form from "./CredentialForms";
import Login from "./Login";
import './App.css'




function App() {
  const [status, setStatus] = useState("");
  const [company, setCompany] = useState("");
  const update = (company) => {
    setCompany(company)
  }

return(
  <>
  <div className={styles.mainDiv}>
    {company!== "" ? <>
    <Accordion name = {"Fiix Credentials" + (status === "No Connection" ? " (" + status + ")" : "")} children = {<Form setStatus = {setStatus} company = {company}/> }  />
    <Accordion name = {"Linortek"} children = {<IdTable idType = {"MacAddress"} company = {company}/>} />
    <Accordion name = {"Nettra"} children = {<IdTable idType = {"NettraId"} company = {company}/>} />
    </>
    :
    <Login handler={update}/>}
  
  </div>
  </>
)
}


export default App; 