import './App.css';
import Navbar from './Navbar';
import Find from './Find';
import Upload from './Upload';
import News from './News';
import Stats from './Statistics';
import Feed from './Feed';
import Login from './Login';
import {BrowserRouter as Router,Routes,Route} from "react-router-dom"


function App() {
  return (
    <Router>
    <div className="App">
    <Routes>
      <Route path='/Find' element={
       <div>
        <Navbar />
        <Find/>
        
       </div>
      }/>
      
      <Route path='/' element={
       <div>
        <Navbar />
        <Upload/>
       </div>
      }/>
      <Route path='/Help' element={
       <div>
        <Navbar />
        <News/>
       </div>
      }/>
      <Route path='/Login' element={
       <div>
        <Navbar />
        <Login/>
       </div>
      }/>

    </Routes>
      
    </div>
    </Router>
  );
}

export default App;
