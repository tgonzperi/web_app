import './InputForm.css'
function Input(props)
{
  return(
    <>
        <tr>
        <td>
        <input
        id={props.idType}
        className="InputForm"
        name={props.id || props.idType}
        type="text"
        value={props.inputs[props.idType] || ""}
        onChange={props.idType === 'MacAddress' ? props.handleChangeMAC : props.handleChange}
        /> 
        </td>
        <td>
        <input
        id="id0"
        className="InputForm"
        name={props.id || "id0"}
        type="number"
        value={props.inputs.id0 || ""}
        onChange={props.handleChange}
        /> 
        </td>
        <td>
        <input
        id="id1"
        className="InputForm"
        name={props.id || "id1"}
        type="number"
        value={props.inputs.id1 || ""}
        onChange={props.handleChange}
        /> 
        </td>
        <td>
        <input
        id="id2"
        className="InputForm"
        name={props.id || "id2"}
        type="number"
        value={props.inputs.id2 || ""}
        onChange={props.handleChange}
        /> 
        </td>
        <td>
        <input
        id="id3"
        className="InputForm"
        name={props.id || "id3"}
        type="number"
        value={props.inputs.id3 || ""}
        onChange={props.handleChange}
        /> 
        </td>
        <th><button name = {props.id} onClick = {props.handlebutton1}>{props.button1}</button> {props.edit ? <button onClick = {props.handlebutton2}>{props.button2}</button> : <></>}</th>
      </tr>
    </>
  )
}

export default Input;
