
import { useReduxDispatch, useReduxSelector } from '../redux'
import { Link, useNavigate } from 'react-router-dom'
import { logout, reset } from '../redux/auth/authSlice'
import { NavLink } from "react-router-dom"


function NavBar() {
    const navigate = useNavigate();
    const dispatch = useReduxDispatch();
    const { user } = useReduxSelector((state) => state.auth);
    const token = localStorage.getItem('token');

    const onLogout = () => {
        dispatch(logout());
        dispatch(reset());
        navigate('/login');
    };
    return (
        <>
            {/* <NavLink className='sjs-nav-button' to="/"><span>My Surveys</span></NavLink>
            <NavLink className='sjs-nav-button' to="/dashboard"><span>Analytics</span></NavLink>
            <NavLink className='sjs-nav-button' to="/about"><span>About</span></NavLink> */}
            {token ? (
                <>
                    <NavLink to="/"><img src="logo1000.png" className="sjs-client-app__logo" alt="logo" height={'50px'} /></NavLink>
                    <NavLink to="/" className='sjs-nav-button' onClick={onLogout}>Logout</NavLink>

                </>
            ) : (
                <>
                    <NavLink to="/"><img src="logo1000.png" className="sjs-client-app__logo" alt="logo" height={'50px'} /></NavLink>
                    <NavLink className=' signup-btn' to="/register"><span>Sign Up</span></NavLink>
                    <NavLink className='login-btn' to="/login"><span>Sign In</span></NavLink>
                </>
            )}

        </>
    )
}

export default NavBar;