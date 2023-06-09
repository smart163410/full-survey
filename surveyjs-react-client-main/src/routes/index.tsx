import React from 'react'
import { Route, NavLink, Routes } from 'react-router-dom'
import Home from "../pages/Home"
import About from "../pages/About"
import Run from "../pages/Run"
import Edit from "../pages/Edit"
import Results from "../pages/Results"
import Login from '../pages/Login'
import Register from '../pages/Register'
// import Dashboard from '../pages/Dashboad'
import Analytics from '../pages/Analytics'
import First from '../First'


const NoMatch = () => (<><h1>404</h1></>)

const Content = (): React.ReactElement => (
    <>
        <Routes>
            {/* <Route path='/dashboard' element={<Dashboard />}></Route> */}
            <Route path="/login" element={<Login />}></Route>
            <Route path="/register" element={<Register />}></Route>
            <Route path="/home" element={<Home />}></Route>
            <Route path="/" element={<First />}></Route>
            <Route path="/analytics" element={<Analytics />}></Route>
            <Route path="/about" element={<About />}></Route>
            <Route path="/run/:id" element={<Run />}></Route>
            <Route path="/edit/:id" element={<Edit />}></Route>
            <Route path="/results/:id" element={<Results />}></Route>
            <Route element={<NoMatch />}></Route>
        </Routes>
    </>
)

export default Content