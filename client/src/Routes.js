
import MainApp from './home/App';
import Register from './register/App';
import Login from './home/Login'

import { useState } from 'react'
import { Navigate } from 'react-router-dom';
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";

function AppRoutes(){

    const [company, setCompany] = useState("");
    const update = (company) => {
      setCompany(company)
      console.log(company)
    }
    return(

    <Router>
        <Routes>
        <Route path="/" element={<Navigate to='/login' />} />
        <Route path="/login" element={<Login handler={update} />}/>
        <Route path="/home" element={<MainApp company={company}/>} />
        <Route path="/register" element={<Register />} />
        <Route path="*" element={<h1>Wrong path</h1>}/>
    </Routes>
  </Router>
    )
}
export default AppRoutes;