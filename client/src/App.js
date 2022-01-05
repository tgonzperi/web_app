import { useState, useRef, useEffect} from "react";
import ReactDOM from "react-dom";
import styles from './style.module.css'
import './App.css'


function Form(){
  const [inputs, setInputs] = useState({});

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
      data2send[id[0]] = id[1];
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
    .then((data) => setStatus(data.status));
    const interval = setInterval(() => {
      fetch("/api/fiix/status")
      .then((res) => res.json())
      .then((data) => setStatus(data.status));
    }, 15000);
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
        Status : 
        <label for="sub" style={{verticalAlign: "baseline", color: status === 'No Connection' ? 'red' : 'green'}} > {status} </label>
        <input id="sub" type="submit"/>
        </div>
    </form>
  )
}

function Input(props)
{
  return(
    <>
        <tr>
        <td>
        <input
        id={props.idType}
        name={props.id || props.idType}
        type="text"
        value={props.inputs[props.idType] || ""}
        onChange={props.idType === 'MacAddress' ? props.handleChangeMAC : props.handleChange}
        /> 
        </td>
        <td>
        <input
        id="id0"
        name={props.id || "id0"}
        type="text"
        value={props.inputs.id0 || ""}
        onChange={props.handleChange}
        /> 
        </td>
        <td>
        <input
        id="id1"
        name={props.id || "id1"}
        type="text"
        value={props.inputs.id1 || ""}
        onChange={props.handleChange}
        /> 
        </td>
        <td>
        <input
        id="id2"
        name={props.id || "id2"}
        type="text"
        value={props.inputs.id2 || ""}
        onChange={props.handleChange}
        /> 
        </td>
        <td>
        <input
        id="id3"
        name={props.id || "id3"}
        type="text"
        value={props.inputs.id3 || ""}
        onChange={props.handleChange}
        /> 
        </td>
        <th><button name = {props.id} onClick = {props.handlebutton1}>{props.button1}</button> {props.edit ? <button onClick = {props.handlebutton2}>{props.button2}</button> : <></>}</th>
      </tr>
    </>
  )
}


function Accordion(props)
{
  const [isActive, setActive] = useState("false");

  const ref = useRef(null);
  const refButton = useRef(null);

  refButton.current = props.errormsg ? styles.accordionError : styles.accordion;


  // useEffect(() => {
  // if(props.errormsg){
  //   ref.current.backgroundColor = '#FFFFFF'
  //   ref.current.color = '#FF0000'
  //   console.log("HOOO")
  // } 
  // })

  const ToggleClass = () => {
    setActive(!isActive);
    if(ref.current.style.maxHeight){
      ref.current.style.maxHeight = null;
      ref.current.style.padding = "0px 18px"
    }else{
      ref.current.style.maxHeight = (ref.current.scrollHeight + 300) + "px";
      ref.current.style.padding = "10px 18px"
    }
  };


  return (
  <>
  <button className={isActive ? (refButton.current) : (refButton.current + ' ' + (props.errormsg ? null : styles.active))} onClick={ToggleClass}>{props.name}</button>
  <div ref={ref} className={styles.panel}>
  {props.children}
  </div>
  </>
  )
}

function ErrorMessage(props){
  
 

  return (
    <>

    </>
  )
}


function Table(props){

  const hex = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'A', 'B', 'C', 'D', 'E', 'F', 'a', 'b', 'c', 'd', 'e', 'f', ':', ' ']
  const hexMinus = ['a', 'b', 'c', 'd', 'e', 'f'];
  const hexMayus = ['A', 'B', 'C', 'D', 'E', 'F'];
  
  var DeviceType = props.idType === 'MacAddress' ? 'linortek' : 'nettra';

  const [showErrors, setShowErrors] = useState(false);
  const [errorList, setErrorList] = useState([]);

  const [inputs, setInputs] = useState({});

  const [columns, setColumns] = useState([]);
  const stateRef = useRef();
  const previousLine = useRef();

  stateRef.current = columns;

  useEffect(() => {
    fetch("/api/errors/" + DeviceType)
    .then((res) => res.json())
    .then((data) => {
      console.log(data)
      if(data.length === 0) setShowErrors(false);
      else{
        setShowErrors(true);
        let list = []
        data.forEach((el, index) => {
          let li = <li> {el.message} </li>
          list.push(li);
        })
        setErrorList(list);
      }

    })

    const interval = setInterval(() => {
      fetch("/api/errors/" + DeviceType)
      .then((res) => res.json())
      .then((data) => {
        if(data.length === 0) setShowErrors(false);
        else{
          setShowErrors(true);
          let list = []
          data.forEach((el, index) => {
            let li = <li> {el.message} </li>
            list.push(li);
          })
          setErrorList(list);
        }

      })
    }, 8000);
  },[DeviceType])

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
            <td>{el[props.idType]}</td>
            <td>{el.id0}</td>
            <td>{el.id1}</td>
            <td>{el.id2}</td>
            <td>{el.id3}</td>
            <td><button style={{margin:"2px 0px"}} name={'edit'+el.id} onClick = {editLine}>Edit</button><button style={{padding:"2px 0px"}} name={'delete'+el.id} onClick = {removeLine}>Delete</button></td>
          </tr>

        }
        columns2add.push(obj);        
      });

      setColumns(columns2add);
    })   
  },[DeviceType, props.idType])



  const handleChangeMAC = (event) => {
    const setMac = (value) => {
      let pp = [2, 5, 8, 11, 14];
      let ret = ''
      for(let i = 0; i < value.length; i++){ 
        if(pp.includes(i) && value[i] !== ':'){
          ret+=':';
        }
        let index = hexMinus.indexOf(value[i]);
        if(index !== -1){
          ret += hexMayus[index];
        }else{
          ret += value[i];
        }
 
      }
      return ret;
    }

    const name = event.target.name;
    var value = event.target.value;
    var isValid = true;

    for(let hexval of value)
    {
      isValid &= (hex.includes(hexval)) ? true : false;
    }

    if(isValid && value.length < 18){
      value = setMac(value);
      // if(pp.includes(len) && value[value.length - 1] !== ":"){
      //   value += ":";
      // }
      setInputs(values => ({...values, [name]: value}));
    }
  }
  const handleChange = (event) => {
    const name = event.target.name;
    var value = event.target.value;
    console.log("Value :" ,value)
    setInputs(values => ({...values, [name]: value}));
  }

  const eraseInputs = (event) => {
    setInputs({});
  }

  const saveEdit = (e) => {
    const id = e.target.getAttribute("name");
    var index = stateRef.current.findIndex((elem) => elem.id == id);
    var device_id = stateRef.current[index].device_id


    let inputs2 = stateRef.current[index].component.props.inputs
    if(inputs2[props.idType] === '' || inputs2.id0 === ''){
      alert(props.idType + ' and id0 are required')
    }else{
    var newComponent = {id: id, device_id: device_id, 
      component: <tr>
      <td>{inputs2[props.idType]}</td>
      <td>{inputs2.id0}</td>
      <td>{inputs2.id1}</td>
      <td>{inputs2.id2}</td>
      <td>{inputs2.id3}</td>
      <td><button style={{margin:"2px 0px"}} name={'edit'+id} onClick = {editLine}>Edit</button><button style={{padding:"2px 0px"}} name={'delete'+id} onClick = {removeLine}>Delete</button></td>
    </tr>}

    var data2send = {
      id: id,
      data: inputs2
    };



    fetch('/api/edit_mqtt/' + DeviceType, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(data2send)
    });

      setColumns(oldColumns => oldColumns.map((el)=> {
        return el.id == id ? newComponent : el;
      }));
    }
     }


  const cancelEdit = e => {
    setColumns(previousLine.current)
  }

  const handleChangeEdit = (event) => {
    var name = event.target.name;
    var value = event.target.value;
    var id_input = event.target.id;
    
    var index = stateRef.current.findIndex((elem) => elem.id == name);
    var id = stateRef.current[index].id
    let newInputs = {}
    newInputs = stateRef.current[index].component.props.inputs
    newInputs[id_input] = value;
    var device_id = newInputs[props.idType]
    var newComponent = {id: id, device_id: device_id, component:
      <Input id={id} handleChangeMAC={handleChangeMACEdit} handleChange={handleChangeEdit} addLine={addLine} inputs={newInputs} idType={props.idType} edit={true} button1={"Save"} button2={"Cancel"} handlebutton1={saveEdit} handlebutton2={cancelEdit}/>
    }
    setColumns(oldColumns => oldColumns.map((item) => {
      return item.id === id ? newComponent : item;
      
    }))
  }

  const handleChangeMACEdit = (event) => {
    const setMac = (value) => {
      let pp = [2, 5, 8, 11, 14];
      let ret = ''
      for(let i = 0; i < value.length; i++){ 
        if(pp.includes(i) && value[i] !== ':'){
          ret+=':';
        }
        let index = hexMinus.indexOf(value[i]);
        if(index !== -1){
          ret += hexMayus[index];
        }else{
          ret += value[i];
        }
 
      }
      return ret;
    }

    var name = event.target.name;
    var value = event.target.value;
    var id_input = event.target.id;
    var isValid = true;

    for(let hexval of value)
    {
      isValid &= (hex.includes(hexval)) ? true : false;
    }

    console.log(stateRef.current)
    if(isValid && value.length < 18){
      value = setMac(value);
      var index = stateRef.current.findIndex((elem) => elem.id == name);
      var td = stateRef.current[index].component
      var id = td.props.id  
      let newInputs = {}
      newInputs = td.props.inputs;
      newInputs[id_input] = value;
    
      var device_id = newInputs[props.idType]
      var newComponent = {id: id, device_id: device_id, 
      component: <Input id={id} handleChangeMAC={handleChangeMACEdit} handleChange={handleChangeEdit} addLine={addLine} inputs={newInputs} idType={props.idType} edit={true} button1={"Save"} button2={"Cancel"} handlebutton1={saveEdit} handlebutton2={cancelEdit}/>
    }
    setColumns(oldColumns => oldColumns.map((item) => {
      return item.id === id ? newComponent : item;
      
    }))
    }  


  }

  const editLine = e => {


    previousLine.current = stateRef.current;
    const name = e.target.getAttribute("name");

    var index = stateRef.current.findIndex((elem) => 'edit'+elem.id == name);
    console.log(stateRef.current)
    var newInputs = {
      [props.idType]: stateRef.current[index].component.props.children[0].props.children,
      id0: stateRef.current[index].component.props.children[1].props.children,
      id1: stateRef.current[index].component.props.children[2].props.children,
      id2: stateRef.current[index].component.props.children[3].props.children,
      id3: stateRef.current[index].component.props.children[4].props.children,
    }
    var id = stateRef.current[index].id
    var device_id = stateRef.current[index].device_id
    var newComponent = {id: id, device_id: device_id, component:
      <Input id={id} handleChangeMAC={handleChangeMACEdit} handleChange={handleChangeEdit} addLine={addLine} inputs={newInputs} idType={props.idType} edit={true} button1={"Save"} button2={"Cancel"} handlebutton1={saveEdit} handlebutton2={cancelEdit}/>
    }
    console.log(newComponent)
    setColumns(oldColumns => oldColumns.map((item) => {
      return item.id === id ? newComponent : item;
      
    }))
  }
  const removeLine = e => {
    const name = e.target.getAttribute("name");
    var element = stateRef.current.find((elem) => 'delete'+elem.id == name);
    
    console.log(element)
    var data2send = {id: element.id, device_id: element.device_id};

    fetch('/api/rm_mqtt/' + DeviceType, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(data2send)
    });
    setColumns(stateRef.current.filter((list) => ('delete'+list.id != name)));

  }

  const removeAll = () => {

    setColumns([]);

    fetch('/api/rm_all_mqtt/' + DeviceType, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'}
    });  
  }

  const addLine = () => {
    let id = 1;
    let bool = true;


    if(typeof inputs[props.idType] === 'undefined' || typeof inputs.id0 === 'undefined'){
      alert(props.idType + ' and id0 are required')
    }else{
      if(stateRef.current.length !== 0)
      {
        console.log("Id != 1")
        while(bool){
          bool = false;
          id++;
          console.log("Id = : ", id)
          for(let el of stateRef.current){
            if(el.id === id){
              bool = true;
              console.log("IN!!!")
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


      setColumns(oldColumns => [...oldColumns, {id: id, device_id: inputs[props.idType], component: <tr>
        <td>{inputs[props.idType]}</td>
        <td>{inputs.id0}</td>
        <td>{inputs.id1}</td>
        <td>{inputs.id2}</td>
        <td>{inputs.id3}</td>
        <td><button style={{margin:"2px 0px"}} name={'edit'+id} onClick = {editLine}>Edit</button><button style={{padding:"2px 0px"}} name={'delete'+id} onClick = {removeLine}>Delete</button></td>
      </tr>}]);
    }
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
      {<Input handleChangeMAC={handleChangeMAC} handleChange={handleChange} inputs={inputs} idType={props.idType} button1={"Add Line"} handlebutton1={addLine}/>/* <tr>
        <th>
        <input
        id={props.idType}
        name={props.idType}
        type="text"
        value={inputs[props.idType] || ""}
        onChange={props.idType === 'MacAddress' ? handleChangeMAC : handleChange}
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
        <th><button onClick = {addLine}> Add Line</button></th>
      </tr>*/}
    </table>
     <button onClick= {removeAll}> Remove All</button>
     {showErrors ? <Accordion name = {"Errors"} children = {<lu>{errorList}</lu>} errormsg={true} /> : null}
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