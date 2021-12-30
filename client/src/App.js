import { useState, useRef, useEffect} from "react";
import ReactDOM from "react-dom";
import styles from './style.module.css'
import './App.css'


function Form(){
  const [inputs, setInputs] = useState({});

  const [status, setStatus] = useState(false);

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
      data2send[id[0]] = id[1];
    }
    console.log(data2send)
    fetch('/api/fiix/form', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(data2send)
    });
    eraseInputs();
  }

  useEffect(() => {
    const interval = setInterval(() => {
      fetch("/api/fiix/status")
      .then((res) => res.json())
      .then((data) => setStatus(data.status));
    }, 5000);
    return () => clearInterval(interval);
  },[]);
  


  return (
    // <form onSubmit={handleSubmit} action="/form">
    <form onSubmit={handleSubmit}>
      <label for="BaseURI"> Enter BaseURI: </label><br/>
      <input 
        id="BaseURI"
        type="text" 
        name="BaseURI" 
        value={inputs.BaseURI || ""} 
        onChange={handleChange}
        required
      /><br/>
      <label for="APPKey">Enter APPKey: </label><br/>
        <input 
          id="APPKey"
          type="text" 
          name="APPKey" 
          value={inputs.APPKey || ""} 
          onChange={handleChange}
          required
        /><br/>
      <label for="AuthToken">Enter AuthToken: </label><br/>
        <input 
          id="AuthToken"
          type="text" 
          name="AuthToken" 
          value={inputs.AuthToken || ""} 
          onChange={handleChange}
          required
        /><br/>
      <label for="PKey">Enter PKey: </label><br/>
        <input function
          id="PKey"
          type="text" 
          name="PKey" 
          value={inputs.PKey || ""} 
          onChange={handleChange}
          required
        /><br/>
        {/* <h5 style={{width: "50%", margin: 0 }}> Connection {status}</h5> */}
        <div style={{"margin-top":"20px", height:"40px"}}>
        <label for="sub" style={{verticalAlign: "baseline"}} >Status : {status} </label>
        <input id="sub" type="submit"/>
        </div>
    </form>
  )
}



function Accordion(props)
{
  const [isActive, setActive] = useState("false");

  const ref = useRef(null);

  const ToggleClass = () => {
    setActive(!isActive);
    if(ref.current.style.maxHeight){
      ref.current.style.maxHeight = null;
    }else{
      ref.current.style.maxHeight = (ref.current.scrollHeight + 300) + "px";
    }
  };


  return (
  <>
  <button className={isActive ? (styles.accordion) : (styles.accordion + ' ' + styles.active)} onClick={ToggleClass}>{props.name}</button>
  <div ref={ref} className={styles.panel}>
  {props.children}
  </div>
  </>
  )
}


function Table(props){

  const hex = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'A', 'B', 'C', 'D', 'E', 'F', 'a', 'b', 'c', 'd', 'e', 'f', ':', ' ']
  
  var DeviceType = props.idType === 'MacAddress' ? 'linortek' : 'nettra';
  useEffect(()=> {
    fetch("/api/mqtt/" + DeviceType , {
      method: 'POST'
    })
    .then((res) => res.json())
    .then((data) => {
      let columns2add = [];
      data.forEach(el => {
        let obj = 
        {
          id: el.id,
          component: 
          <tr>
            <th>{el[props.idType]}</th>
            <th>{el.id0}</th>
            <th>{el.id1}</th>
            <th>{el.id2}</th>
            <th>{el.id3}</th>
            <th><button name={el.id} onClick = {removeLine}>Remove Line</button></th>
          </tr>

        }
        columns2add.push(obj);        
      });

      setColumns(columns2add);
    })   
  },[DeviceType, props.idType])
  const [inputs, setInputs] = useState({});

  const [columns, setColumns] = useState([]);
  const stateRef = useRef();

  stateRef.current = columns;


  const handleChange = (event) => {
    let pp = [2, 5, 8];
    const name = event.target.name;
    var value = event.target.value;
    if((hex.includes(value[value.length -1]) || value.length === 0) && value.length < 13){
      // if(pp.includes(len) && value[value.length - 1] !== ":"){
      //   value += ":";
      // }
      setInputs(values => ({...values, [name]: value}));
    }
  }

  const eraseInputs = (event) => {
    setInputs({});
  }

  const removeLine = e => {
    const name = e.target.getAttribute("name");
    var element = stateRef.current.find((elem) => elem.id == name);

    var data2send = {id: element.id};

    fetch('/api/rm_mqtt/' + DeviceType, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(data2send)
    });
    setColumns(stateRef.current.filter((list) => (list.id != name)));

  }

  const removeAll = () => {

    setColumns([]);

    fetch('/api/rm_all_mqtt/' + DeviceType, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'}
    });  
  }

  const addLine = () => {
    let id = 0;
    let bool = true;
    if(stateRef.current.length === 0)
    {
      id = 1;
    }else
    {
      while(bool){
        bool = false;
        id++;
        for(let el of stateRef.current){
          if(el.id === id){
            bool = true;
            break;
          }
        }
      }
    }

    var data2send = {
      id: id,
      data: inputs
    };



    fetch('/api/add_mqtt/' + DeviceType, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(data2send)
    });


    setColumns(oldColumns => [...oldColumns, {id: id, component: <tr>
      <th>{inputs[props.idType]}</th>
      <th>{inputs.id0}</th>
      <th>{inputs.id1}</th>
      <th>{inputs.id2}</th>
      <th>{inputs.id3}</th>
      <th><button name={id} onClick = {removeLine}>Remove Line</button></th>
    </tr>}]);
    eraseInputs();
  }

  return (
    <>
    <table>
      <tr>
        <th>{props.idType}</th>
        <th>id0</th>
        <th>id1</th>
        <th>id2</th>
        <th>id3</th>
        <th></th>
      </tr>
      {columns.map((element) => element.component)}
      <tr>
        <th>
        <input
        id={props.idType}
        name={props.idType}
        type="text"
        value={inputs[props.idType] || ""}
        onChange={handleChange}
        /> 
        </th>
        <th>
        <input
        id="id0"
        name="id0"
        type="text"
        value={inputs.id0 || ""}
        onChange={handleChange}
        /> 
        </th>
        <th>
        <input
        id="id1"
        name="id1"
        type="text"
        value={inputs.id1 || ""}
        onChange={handleChange}
        /> 
        </th>
        <th>
        <input
        id="id2"
        name="id2"
        type="text"
        value={inputs.id2 || ""}
        onChange={handleChange}
        /> 
        </th>
        <th>
        <input
        id="id3"
        name="id3"
        type="text"
        value={inputs.id3 || ""}
        onChange={handleChange}
        /> 
        </th>
        <th></th>
      </tr>
    </table>
    <button onClick = {addLine}> Add Line</button> <button onClick= {removeAll}> Remove All</button>
    </>
  )
}

function App() {

return(
  <>
  <div className={styles.mainDiv}>
    <Accordion name = {"Fiix Connection Data"} children = {<Form />} />
    <Accordion name = {"Linortek"} children = {<Table idType = {"MacAddress"}/>}/>
    <Accordion name = {"Nettra"} children = {<Table idType = {"NettraId"}/>}/>
  </div>
  </>
)
}


export default App; 