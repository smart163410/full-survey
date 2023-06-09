import { useEffect } from 'react';
import ThemeCustomization from './themes';
import { Provider } from 'react-redux';
import { BrowserRouter as Router } from "react-router-dom";
import Content from './routes'
import store from './redux';
import { ConfigProvider } from './contexts/ConfigContext';
import './App.css';
// import logo from './logo.svg';
import NavBar from './routes/NavBar';
import setAuthToken from './utils/setAuthToken';

function App() {
  useEffect(() => {
    setAuthToken(); // set the token in http header
  }, []);
  return (
    <Provider store={store}>
      <Router>
        <ConfigProvider>
          <ThemeCustomization>
            <div className="sjs-client-app">
              <header className="sjs-client-app__header">
                {/* <img src={logo} className="sjs-client-app__logo" alt="logo" height={'50px'} /> */}
                <NavBar />
              </header>
              <main className="sjs-client-app__content">
                <Content />
              </main>
              <footer className="sjs-client-app__footer">
              </footer>
            </div>
          </ThemeCustomization>
        </ConfigProvider>
      </Router>
    </Provider>

  );
}

export default App;
