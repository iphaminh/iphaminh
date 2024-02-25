// App.js
import React from 'react';
import LandingPage from './pages/LandingPage/LandingPage'; // Adjust the path if necessary
import CustomNavbar from './components/Navbar/Navbar';

function App() {
  return (
    <div className="App">
      <CustomNavbar /> 
      <LandingPage />  {/* Use your Navbar component */}
    </div>
  );
}

export default App;
