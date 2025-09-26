import React, { useState, useEffect } from "react";
import { Rating, CircularProgress, Box, Typography, Card, CardContent, Avatar } from "@mui/material";
import Masonry from "@mui/lab/Masonry";
import UserAvatar from "../Components/UserAvatar";

const Testimonial = () => {
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyQPMDOtxn2sbxmcrEs-dlBVlu4sjbV7uOtsZpjAjkyhBsF9oPi01nVxTMd7PFDwcCCrQ/exec";

  const fetchTestimonials = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${GOOGLE_SCRIPT_URL}?action=getTestimonials`);
      if (!response.ok) throw new Error(`Failed to fetch testimonials: ${response.status}`);
      const data = await response.json();
      if (data.success && data.testimonials) setTestimonials(data.testimonials);
      else throw new Error(data.message || "No testimonials found");
    } catch (err) {
      setError(err.message);
      setTestimonials([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTestimonials();
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: 400, background: "linear-gradient(135deg, rgba(0,0,0,0.9) 0%, rgba(50,50,50,0.95) 100%)", color: "white" }}>
        <Box sx={{ textAlign: "center" }}>
          <CircularProgress sx={{ color: "#FF9800", mb: 2 }} />
          <Typography variant="h6">Loading testimonials...</Typography>
        </Box>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ textAlign: "center", minHeight: 400, background: "linear-gradient(135deg, rgba(0,0,0,0.9) 0%, rgba(50,50,50,0.95) 100%)", color: "white", padding: 4 }}>
        <Typography variant="h4" color="error" gutterBottom>Error Loading Testimonials</Typography>
        <Typography variant="body1">{error}</Typography>
        <button onClick={fetchTestimonials} style={{ background: "#FF9800", color: "white", border: "none", padding: "8px 16px", borderRadius: 5, cursor: "pointer" }}>
          Try Again
        </button>
      </Box>
    );
  }

  return (
    <Box
      id="testimonials"
      sx={{
        background: "linear-gradient(135deg, rgba(0,0,0,0.9) 0%, rgba(50,50,50,0.95) 100%)",
        color: "white",
        p: { xs: 3, md: 6 },
        
        display: "flex",        // Added for centering
        flexDirection: "column",
        justifyContent:"center",
        alignItems: "center",
        textAlign: "center"     // centers text horizontally
      }}
    >
      <Typography
        variant="h4"
        component="h4"
        sx={{
          mb: 5,
          fontFamily: "'AlanSans', sans-serif",
          fontWeight: 700,
          background: "linear-gradient(45deg, #FF9800 30%, #FF5722 90%)",
          backgroundClip: "text",
          WebkitBackgroundClip: "text",
          color: "transparent"
        }}
      >
        What They've Said
      </Typography>

      <Box sx={{ width: "100%", maxWidth: 1200 ,justifyContent:"center" }} >
        <Masonry columns={{ xs: 1, sm: 2, md: 3 }} spacing={3}>
          {testimonials.map((testimonial, index) => (
            <Card
              key={index}
              sx={{
                background: "rgba(255,255,255,0.05)",
                backdropFilter: "blur(10px)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 2,
                overflow: "hidden",
                transition: "transform 0.3s ease, box-shadow 0.3s ease",
                "&:hover": {
                  transform: "translateY(-5px)",
                  
                }
              }}
            >
              <CardContent sx={{ p: 2, display: "flex", flexDirection: "column", textAlign: "left" }}>
                <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                  <UserAvatar photoUrl={testimonial.photo} name={testimonial.name} />
                  

                  <Box>
                    <Typography variant="subtitle1" sx={{ color: "#FFFF", fontWeight: 600, fontFamily: "'AlanSans', sans-serif" }}>
                      {testimonial.name}
                    </Typography>
                    <Rating
                      value={testimonial.rating}
                      readOnly
                      size="small"
                      sx={{ color: "#FF9800", "& .MuiRating-iconFilled": { color: "#FF9800" } }}
                    />
                    <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.5)", display: "block", mt: 0.5 }}>
                      {new Date(testimonial.timestamp).toLocaleDateString()}
                    </Typography>
                  </Box>
                </Box>

            

<div className=" relative  text-[rgba(255,255,255,0.9)] font-in px-2 text-center flex justify-center">
<div className=" absolute text-[#FF9800] text-2xl top-0 left-0">“</div>
<div className=" absolute text-[#FF9800] text-2xl bottom-0 right-0">”</div>
{testimonial.comment} 
</div>
              </CardContent>
            </Card>
          ))}
        </Masonry>
      </Box>

      {testimonials.length === 0 && (
        <Box sx={{ textAlign: "center", mt: 4 }}>
          <Typography variant="h6" sx={{ color: "rgba(255,255,255,0.7)" }}>
            No testimonials yet. Be the first to share your experience!
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default Testimonial;
