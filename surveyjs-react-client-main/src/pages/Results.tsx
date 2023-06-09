import React, { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useReduxDispatch, useReduxSelector } from '../redux'
// import Viewer from '../components/Viewer'

import { load } from '../redux/results'
import { get } from '../redux/surveys'

const Results = () => {
    const navigate = useNavigate();

    const { id } = useParams();

    const { user } = useReduxSelector((state) => state.auth);
    const dispatch = useReduxDispatch()
    const postStatus = useReduxSelector(state => state.surveys.status)
    const surveys = useReduxSelector(state => state.surveys.surveys)
    useEffect(() => {
        if (postStatus === 'idle' && id) {
            dispatch(load(id))
        }
    }, []);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
        }
    }, [user, navigate])

    let survey = surveys.filter(s => s.id === id)[0]
    if (!survey) {
        survey = surveys[0]
    }
    return (<>
        <h1>{survey?.name}</h1>
        <div className='sjs-results-container'>
            {/* <Viewer id={id as string} /> */}
        </div>
    </>);
}

export default Results;