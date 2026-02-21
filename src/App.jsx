import React, { useEffect, useState, useRef } from "react";
import Home from "./Sections/Home";
import "./App.css";
import About from "./Sections/About";
import Testimonial from "./Sections/Testimonial";
import GalleryAndAwards from "./Sections/GalleryAndAwards";
import Footer from "./Sections/Footer";
import NavBar from "./Sections/NavBar";

const SERVER_URL = "https://btsttacademybe.onrender.com";

const App = () => {
  const [contentData, setContentData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showStickyNav, setShowStickyNav] = useState(false);
  
  const homeRef = useRef(null);
  const aboutRef = useRef(null);

  // Single API call to fetch data
  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Use single API endpoint with optional refresh parameter
      const url = `${SERVER_URL}/api/web-content`;
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (result.success && result.data) {
        setContentData(result.data);
      } else {
        throw new Error(result.message || "No data found from server");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Single API call on component mount
    fetchData(false);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (!homeRef.current) return;

      const homeRect = homeRef.current.getBoundingClientRect();
      const homeMidPoint = homeRect.top + (homeRect.height / 2);
      
      // Show sticky nav when Home section's midpoint crosses the top of the viewport
      if (homeMidPoint <= 0) {
        setShowStickyNav(true);
      } else {
        setShowStickyNav(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    
    // Initial check
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [contentData]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-white">
        <div className="text-center">
          <div className="relative inline-block">
            <div className="w-16 h-16 border-4 border-orange-200 rounded-full"></div>
            <div className="absolute top-0 left-0 w-16 h-16 border-4 border-orange-500 rounded-full animate-spin border-t-transparent"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen bg-white">
        <div className="text-center max-w-md mx-4">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Content Not Available</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <p className="text-sm text-gray-500 mb-6">
            Make sure your backend server is running on {SERVER_URL}
          </p>
          <div className="space-y-2">
            <button 
              onClick={() => fetchData(true)}
              className="w-full px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-medium"
            >
              Try Again
            </button>
            <button 
              onClick={() => window.location.reload()}
              className="w-full px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Reload Page
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="App">
      {contentData && (
        <>
          {/* Sticky navbar that appears when Home section's midpoint crosses the top */}
          {showStickyNav && (
            <div className="sticky top-0 z-50 bg-black/20 animate-in slide-in-from-top duration-300">
              <NavBar />
            </div>
          )}
          
          {/* Home section reference for scroll detection */}
          <div ref={homeRef}>
            <Home 
              mainHeading={contentData.MainHeading}
              mainDescription={contentData.MainDescription}
              mainBG={contentData.mainBG}
              mainBGmb={contentData.mainBGmb}
            />
          </div>
          
          {/* About section reference */}
          <div ref={aboutRef}>
            <About 
              aboutHeading={contentData.AboutHeading}
              aboutDescription={contentData.AboutDescription}
              feature1Heading={contentData.dh1}
              feature1Description={contentData.dd1}
              feature2Heading={contentData.dh2}
              feature2Description={contentData.dd2}
              img1={contentData.img1}
              img2={contentData.img2}
              img3={contentData.img3}
              // images={[contentData.img1, contentData.img2, contentData.img3]}
              coachingHeading={contentData.coaching}
              coachingDescription={contentData.coachingDes}
              groupCoachingHeading={contentData.Groupcoaching}
              groupCoachingDescription={contentData.GroupcoachingDes}
              price={contentData.oneTimeCharge}
              timing1Heading={contentData.Timingh1}
              timing1Description={contentData.Timingd1}
              timing2Heading={contentData.Timingh2}
              timing2Description={contentData.Timingd2}
            />
          </div>
          
          <Testimonial />
          <GalleryAndAwards />
          <Footer />
        </>
      )}
    </div>
  );
};

export default App;