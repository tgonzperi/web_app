import logo from './logo.svg';
import './App.css';
import Login from './Login';
import styles from './style.module.css'
import Register from './Register'
import { useState, useRef, useEffect} from "react";

function App() {

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const handler = () => {
    setIsLoggedIn(true)
  }
  return(
    <>
    <div className={styles.mainDiv}>
      { isLoggedIn ? <Register /> : <Login handler={handler}/>}
    </div>
    
    </>
  )
}

export default App;
