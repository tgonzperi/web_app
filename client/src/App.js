import { useState } from "react";
import styles from './style.module.css'
import IdTable from "./IdTable";
import Accordion from "./Accordion";
import Form from "./CredentialForms";
import Login from "./Login";
import './App.css'




function App() {
  const [status, setStatus] = useState("");
  const [updateMain, setUpdateMain] = useState(false);
  const update = (id) => {
    setUpdateMain(true);
  }

return(
  <>
  <div className={styles.mainDiv}>
    {updateMain ? <>
    <Accordion name = {"Fiix Credentials" + (status === "No Connection" ? " (" + status + ")" : "")} children = {<Form setStatus = {setStatus}/>}  />
    <Accordion name = {"Linortek"} children = {<IdTable idType = {"MacAddress"}/>}/>
    <Accordion name = {"Nettra"} children = {<IdTable idType = {"NettraId"}/>}/>
    </>
    :
    <Login handler={update}/>}
  
  </div>
  </>
)
}


export default App; 