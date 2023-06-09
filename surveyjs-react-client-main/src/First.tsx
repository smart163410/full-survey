import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './components/first.css';

function First(){
	const navigate = useNavigate();
	const token = localStorage.getItem('token');
	if(token) navigate('/home');
	console.log("TOKen", token);
	return(
		<>
			<div className='first-div'>
				{/* <div className="first-client-app w3-top">
					<header id="myNavbar" className="first-client-app__header w3-bar">
						<img src="logo1000.png" className="first-client-app__logo  " alt="logo" height='50px' />
						<Link to="/register" className="signup-btn" ><span>Sign Up</span></Link>
						<Link to="/login" className="login-btn" ><span>Log In</span></Link>
					</header>
				</div> */}

				<div>
					<div className="container">
						<img src="header.jpg" className="img-title" alt="survey_title"  />
						<Link to="/run/1" className="middle" > <span style={{ fontSize:"15px"}}>&#8617;</span> Let's go!</Link>

						<div style={{color: "white", marginTop: "12px", textAlign: "right", fontSize: "smaller"}}>
							✓ No credit card required<br />
							✓ No time limit on Free plan
						</div>
					</div>

				</div>

				<div className="relative">
					<h1 style={{fontSize: 'xxx-large'}}>Survey Masters</h1>
					<h2>Real-Time Survey System</h2>
					<p>Please, take part in this survey: Although survey is simple QA, but this makes great Results.</p>
					<p>To take part in survey, click "Let's go!" button.</p>
				</div>
				<div className="img-fixed">
					<img src={"shutterstock.png"} alt="Survey Masters" />
				</div>
			</div>
			<div dangerouslySetInnerHTML={{ __html: `
					<script type="text/javascript">
					window.onload=function(){
						document.getElementById("manage-body").style.display="none";		
					}
					</script>
				` }} >
				</div>
		</>
	);
}

export default First