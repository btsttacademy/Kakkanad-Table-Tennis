import React from "react";
import Home from "./Sections/Home";
import "./App.css"
import About from "./Sections/About";
import Testimonial from "./Sections/Testimonial";

const App = () => {
  return (
  
  <div className=" App px-2">
    {/* <Home/> */}
    <About/>
    <Testimonial/>
    
  </div>
  
  )
};

export default App;
