import { useState, useEffect, ChangeEvent, FormEvent } from 'react'
import { FaSignInAlt } from 'react-icons/fa'
import { useReduxDispatch, useReduxSelector } from '../redux'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { login, reset } from '../redux/auth/authSlice'
import Spinner from '../components/Spinner'
import '../components/form.css'

function Login() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })

  const { email, password } = formData

  const navigate = useNavigate()
  const dispatch = useReduxDispatch()

  const { user, isLoading, isError, isSuccess, message } = useReduxSelector(
    (state) => state.auth
  )

  useEffect(() => {
    if (isError) {
      toast.error(message)
    }

    if (isSuccess || user) {

      navigate('/home')
    }

    dispatch(reset())
  }, [user, isError, isSuccess, message, navigate, dispatch])

  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFormData((prevState) => ({
      ...prevState,
      [e.target.name]: e.target.value,
    }))
  }

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    const userData = {
      email,
      password,
    }

    dispatch(login(userData))
  }

  if (isLoading) {
    return <Spinner />
  }

  return (
    <>
      <div className='form-box'>
        <section className='heading'>
          <h1>
            <FaSignInAlt /> Sign In
          </h1>
          <p>Sign in and start setting goals</p>
        </section>
        <hr></hr>
        <br></br>
        <section className='form'>
          <form onSubmit={onSubmit}>
            <div className='form-group'>
              <label>Email Address</label>
              <input
                type='email'
                className='form-control'
                id='email'
                name='email'
                value={email}
                placeholder='Enter your email'
                onChange={onChange}
              />
            </div>
            <br></br>
            <div className='form-group'>
              <label>Password</label>
              <input
                type='password'
                className='form-control'
                id='password'
                name='password'
                value={password}
                placeholder='Enter password'
                onChange={onChange}
              />
            </div>
            <hr></hr>
            <div className='form-group'>
              <button type='submit' className='btn-block'>
                Submit
              </button>
            </div>
          </form>
        </section>
      </div>
    </>
  )
}

export default Login
