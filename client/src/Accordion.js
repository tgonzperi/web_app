import { useState, useRef } from "react";
import styles from './style.module.css'

function Accordion(props)
{
  const [isActive, setActive] = useState("false");

  const ref = useRef(null);
  const refButton = useRef(null);

  refButton.current = props.errormsg ? styles.accordionError : styles.accordion;


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

export default Accordion;