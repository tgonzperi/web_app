import { useState, useRef, useEffect} from "react";
import Input from './Input'
import Accordion from "./Accordion";

function IdTable(props){

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
      fetch("/api/errors/" + DeviceType, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({company: props.company})
      })
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
        fetch("/api/errors/" + DeviceType, {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({company: props.company})
        })
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
    },[DeviceType, props.company])
  
    useEffect(()=> {
      fetch("/api/mqtt/" + DeviceType , {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({company: props.company})
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
              <td>{el.device_id}</td>
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
    },[DeviceType, props.idType, props.company])
  
  
  
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
        console.log("inputs : ", inputs2.id1);
      var newComponent = {id: id, device_id: device_id, 
        component: <tr>
        <td>{inputs2[props.idType]}</td>
        <td>{inputs2.id0 || ""}</td>
        <td>{inputs2.id1 || ""}</td>
        <td>{inputs2.id2 || ""}</td>
        <td>{inputs2.id3 || ""}</td>
        <td><button style={{margin:"2px 0px"}} name={'edit'+id} onClick = {editLine}>Edit</button><button style={{padding:"2px 0px"}} name={'delete'+id} onClick = {removeLine}>Delete</button></td>
      </tr>}
  
      var data2send = {
        id: id,
        company: props.company,
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
      var data2send = {id: element.id, device_id: element.device_id, company: props.company};
  
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
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({company: props.company})
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
          company: props.company,
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
        {<Input handleChangeMAC={handleChangeMAC} handleChange={handleChange} inputs={inputs} idType={props.idType} button1={"Add Line"} handlebutton1={addLine}/>}
      </table>
       <button onClick= {removeAll}> Remove All</button>
       {showErrors ? <Accordion name = {"Errors"} children = {<lu>{errorList}</lu>} errormsg={true} /> : null}
      </>
    )
  }

  export default IdTable;