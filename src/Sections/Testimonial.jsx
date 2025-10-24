import React, { useState, useEffect, useRef } from "react";
import {
  Rating,
  CircularProgress,
  Box,
  Typography,
  Card,
  CardContent,
  Dialog,
  IconButton,
  Chip,
  MobileStepper,
  Button,
  Grid,
} from "@mui/material";
import { 
  Close, 
  NavigateBefore, 
  NavigateNext,
  KeyboardArrowLeft,
  KeyboardArrowRight,
  ViewCarousel,
} from "@mui/icons-material";
import { useTheme } from '@mui/material/styles';

const Testimonial = () => {
  const [testimonials, setTestimonials] = useState([]);
  const [allTestimonials, setAllTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [imageDialogOpen, setImageDialogOpen] = useState(false);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [allTestimonialsDialogOpen, setAllTestimonialsDialogOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedTestimonial, setSelectedTestimonial] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [activeStep, setActiveStep] = useState(0);
  const [autoPlay, setAutoPlay] = useState(true);
  const [maxLines, setMaxLines] = useState(3);
  
  const theme = useTheme();
  const autoPlayRef = useRef(null);
  const carouselRef = useRef(null);
  const maxSteps = 10; // Number of testimonials in carousel

  // Updated to use your backend API instead of Google Apps Script
  const SERVER_URL = "https://btsttacademybe.onrender.com";
  // const SERVER_URL = "http://localhost:3210";

  // Function to handle base64 images from MongoDB
  const getImageUrl = (photoData) => {
    if (!photoData) return null;

    if (typeof photoData === 'object' && photoData.base64) {
      return `data:${photoData.type || 'image/jpeg'};base64,${photoData.base64}`;
    }
    
    if (typeof photoData === 'string' && photoData.startsWith('data:')) {
      return photoData;
    }
    
    if (typeof photoData === 'string' && photoData.startsWith('http')) {
      return photoData;
    }

    return null;
  };

  // Function to parse additional photos from MongoDB base64 data
  const parseAdditionalPhotos = (photosData) => {
    if (!photosData || !Array.isArray(photosData) || photosData.length === 0) {
      return [];
    }

    try {
      const photoUrls = photosData.map(photo => getImageUrl(photo)).filter(url => url !== null);
      console.log(`📸 Processed ${photoUrls.length} additional photos from MongoDB`);
      return photoUrls;
    } catch (error) {
      console.error("Error parsing additional photos:", error);
      return [];
    }
  };

  // Safe URL validation function
  const testImageUrl = (url) => {
    if (!url || typeof url !== 'string') {
      return false;
    }

    const isValidUrl = url.startsWith('data:') || 
                      url.startsWith('http') || 
                      url.startsWith('https');

    return isValidUrl;
  };

  // Safe image click handler
  const handleImageClick = (testimonial, imageUrl, index = 0) => {
    if (!testImageUrl(imageUrl)) {
      console.warn('Invalid image URL:', imageUrl);
      return;
    }
    
    setSelectedTestimonial(testimonial);
    setSelectedImage(imageUrl);
    setCurrentImageIndex(index);
    setImageDialogOpen(true);
  };

  // Handle testimonial card click for detail dialog
  const handleCardClick = (testimonial) => {
    setSelectedTestimonial(testimonial);
    setDetailDialogOpen(true);
  };

  // Handle view all testimonials
  const handleViewAll = () => {
    setAllTestimonialsDialogOpen(true);
  };

  // Carousel navigation
  const handleNext = () => {
    setActiveStep((prevActiveStep) => (prevActiveStep + 1) % Math.min(maxSteps, testimonials.length));
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => (prevActiveStep - 1 + Math.min(maxSteps, testimonials.length)) % Math.min(maxSteps, testimonials.length));
  };

  // Auto-play functionality with hover/touch control
  useEffect(() => {
    if (autoPlay && testimonials.length > 0) {
      autoPlayRef.current = setInterval(() => {
        handleNext();
      }, 5000); // Change slide every 5 seconds
    }

    return () => {
      if (autoPlayRef.current) {
        clearInterval(autoPlayRef.current);
      }
    };
  }, [autoPlay, testimonials.length]);

  // Handle hover and touch events for auto-play control
  const handleMouseEnter = () => {
    setAutoPlay(false);
  };

  const handleMouseLeave = () => {
    setAutoPlay(true);
  };

  // Touch events for mobile
  const handleTouchStart = () => {
    setAutoPlay(false);
  };

  const handleTouchEnd = () => {
    // Restart auto-play after a delay when touch ends
    setTimeout(() => {
      setAutoPlay(true);
    }, 3000);
  };

  // Responsive text lines
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 600) {
        setMaxLines(2);
      } else if (window.innerWidth < 960) {
        setMaxLines(3);
      } else {
        setMaxLines(4);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const fetchTestimonials = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log("🔄 Fetching testimonials from backend...");

      const response = await fetch(`${SERVER_URL}/api/reviews/testimonials`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch testimonials: ${response.status}`);
      }

      const data = await response.json();
      
      console.log("📊 Backend response:", data);

      if (data.success && data.testimonials) {
        // Sort by rating (highest first)
        const sortedTestimonials = data.testimonials
          .sort((a, b) => (b.rating || 0) - (a.rating || 0))
          .map((testimonial, index) => {
            const additionalPhotos = parseAdditionalPhotos(testimonial.additionalPhotos);
            const profilePhoto = getImageUrl(testimonial.photo);

            return {
              ...testimonial,
              additionalPhotos: additionalPhotos,
              photo: profilePhoto,
              timestamp: testimonial.timestamp || testimonial.storedAt || new Date()
            };
          });

        console.log(`✅ Loaded ${sortedTestimonials.length} testimonials`);
        setAllTestimonials(sortedTestimonials);
        setTestimonials(sortedTestimonials.slice(0, maxSteps)); // Only top 10 for carousel
      } else {
        throw new Error(data.message || "No testimonials found");
      }
    } catch (err) {
      console.error("Fetch error:", err);
      setError(err.message);
      setTestimonials([]);
      setAllTestimonials([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const handleCloseDialogs = () => {
    setImageDialogOpen(false);
    setDetailDialogOpen(false);
    setAllTestimonialsDialogOpen(false);
    setSelectedImage(null);
    setSelectedTestimonial(null);
    setCurrentImageIndex(0);
  };

  const handleNextImage = () => {
    if (selectedTestimonial) {
      const allImages = selectedTestimonial.additionalPhotos || [];
      if (allImages.length === 0) return;
      
      const nextIndex = (currentImageIndex + 1) % allImages.length;
      setCurrentImageIndex(nextIndex);
      setSelectedImage(allImages[nextIndex]);
    }
  };

  const handlePrevImage = () => {
    if (selectedTestimonial) {
      const allImages = selectedTestimonial.additionalPhotos || [];
      const prevIndex = (currentImageIndex - 1 + allImages.length) % allImages.length;
      setCurrentImageIndex(prevIndex);
      setSelectedImage(allImages[prevIndex]);
    }
  };

  // Truncate text based on responsive maxLines
  const truncateText = (text, maxLength = 150) => {
    if (!text) return '';
    
    if (window.innerWidth < 600) {
      maxLength = 100;
    } else if (window.innerWidth < 960) {
      maxLength = 120;
    }
    
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: 400,
          background: "linear-gradient(135deg, rgba(0,0,0,0.9) 0%, rgba(50,50,50,0.95) 100%)",
          color: "white",
        }}
      >
        <Box sx={{ textAlign: "center" }}>
          <CircularProgress sx={{ color: "#FF9800", mb: 2 }} />
          <Typography variant="h6">Loading testimonials...</Typography>
        </Box>
      </Box>
    );
  }

  if (error) {
    return (
      <Box
        sx={{
          textAlign: "center",
          minHeight: 400,
          background: "linear-gradient(135deg, rgba(0,0,0,0.9) 0%, rgba(50,50,50,0.95) 100%)",
          color: "white",
          padding: 4,
        }}
      >
        <Typography variant="h4" color="error" gutterBottom>
          Error Loading Testimonials
        </Typography>
        <Typography variant="body1">{error}</Typography>
        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
          <Button
            onClick={fetchTestimonials}
            variant="contained"
            sx={{ background: "#FF9800" }}
          >
            Try Again
          </Button>
        </Box>
      </Box>
    );
  }

  return (
    <div id="testimonials" className=" pt-[85px]">
<Box
      
      sx={{
        background: "linear-gradient(135deg, rgba(0,0,0,0.9) 0%, rgba(50,50,50,0.95) 100%)",
        color: "white",
        p: { xs: 3, md: 6 },
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        textAlign: "center",
        
        minHeight: '60vh',
        // Custom scrollbar styles
        '& ::-webkit-scrollbar': {
          width: '8px',
        },
        '& ::-webkit-scrollbar-track': {
          background: 'rgba(255,255,255,0.1)',
          borderRadius: '4px',
        },
        '& ::-webkit-scrollbar-thumb': {
          background: 'linear-gradient(45deg, #FF9800 30%, #FF5722 90%)',
          borderRadius: '4px',
        },
        '& ::-webkit-scrollbar-thumb:hover': {
          background: 'linear-gradient(45deg, #FF5722 30%, #FF9800 90%)',
        },
      }}
    >
      <Typography
        variant="h4"
        component="h4"
        sx={{
          mb: 3,
          fontFamily: "'AlanSans', sans-serif",
          fontWeight: 700,
          background: "linear-gradient(45deg, #FF9800 30%, #FF5722 90%)",
          backgroundClip: "text",
          WebkitBackgroundClip: "text",
          color: "transparent",
        }}
      >
        What They've Said
      </Typography>

      {/* Carousel Slider */}
      <Box 
        sx={{ width: "100%", maxWidth: 800, position: 'relative' }}
        ref={carouselRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <Box sx={{ position: 'relative' }}>
          {/* Main Carousel Card */}
          {testimonials[activeStep] && (
            <Card
              onClick={() => handleCardClick(testimonials[activeStep])}
              sx={{
                background: "rgba(255,255,255,0.05)",
                backdropFilter: "blur(10px)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 3,
                overflow: "hidden",
                cursor: 'pointer',
                transition: "transform 0.3s ease, box-shadow 0.3s ease",
                "&:hover": {
                  transform: "translateY(-5px)",
                  boxShadow: "0 10px 30px rgba(255,152,0,0.3)",
                },
                minHeight: 280,
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                  <Box
                    sx={{
                      width: 60,
                      height: 60,
                      borderRadius: '50%',
                      overflow: 'hidden',
                      mr: 2,
                      border: '2px solid #FF9800',
                      flexShrink: 0
                    }}
                  >
                    <img
                      src={testimonials[activeStep].photo || '/default-avatar.png'}
                      alt={testimonials[activeStep].name}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover'
                      }}
                      onError={(e) => {
                        e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMzAiIGZpbGw9IiNGRjk4MDAiLz4KPHN2ZyB4PSIxNSIgeT0iMTUiIHdpZHRoPSIzMCIgaGVpZ2h0PSIzMCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJ3aGl0ZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEyIDEyYzIuMjEgMCA0LTEuNzkgNC00cy0xLjc5LTQtNC00LTQgMS43OS00IDQgMS43OSA0IDQgNHptMCAyYy0yLjY3IDAtOCAxLjM0LTggNHYyaDE2di0yYzAtMi42Ni01LjMzLTQtOC00eiIvPgo8L3N2Zz4KPC9zdmc+';
                      }}
                    />
                  </Box>
                  <Box sx={{ flexGrow: 1, textAlign: 'left' }}>
                    <Typography
                      variant="h6"
                      sx={{
                        color: "#FFFF",
                        fontWeight: 600,
                        fontFamily: "'AlanSans', sans-serif",
                        fontSize: { xs: '1rem', md: '1.25rem' }
                      }}
                    >
                      {testimonials[activeStep].name}
                    </Typography>
                    <Rating
                      value={testimonials[activeStep].rating}
                      readOnly
                      size={window.innerWidth < 600 ? "small" : "medium"}
                      sx={{
                        color: "#FF9800",
                        "& .MuiRating-iconFilled": { color: "#FF9800" },
                      }}
                    />
                    <Typography
                      variant="caption"
                      sx={{
                        color: "rgba(255,255,255,0.5)",
                        display: "block",
                        mt: 0.5,
                      }}
                    >
                      {new Date(testimonials[activeStep].timestamp).toLocaleDateString()}
                    </Typography>
                  </Box>
                </Box>

                {/* Responsive Comment Text */}
                <Typography
                  variant="body1"
                  sx={{
                    color: "rgba(255,255,255,0.9)",
                    lineHeight: 1.6,
                    textAlign: 'left',
                    mb: 2,
                    display: '-webkit-box',
                    WebkitLineClamp: maxLines,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    fontSize: {
                      xs: '0.875rem',
                      sm: '0.9rem',
                      md: '1rem'
                    },
                    minHeight: maxLines * 1.6 + 'em'
                  }}
                >
                  <Box 
                    component="span" 
                    sx={{ 
                      color: '#FF9800', 
                      fontSize: {
                        xs: '1.2rem',
                        md: '1.5rem'
                      },
                      verticalAlign: 'middle',
                      mr: 0.5
                    }}
                  >
                    "
                  </Box>
                  {truncateText(testimonials[activeStep].comment)}
                  <Box 
                    component="span" 
                    sx={{ 
                      color: '#FF9800', 
                      fontSize: {
                        xs: '1.2rem',
                        md: '1.5rem'
                      },
                      verticalAlign: 'middle',
                      ml: 0.5
                    }}
                  >
                    "
                  </Box>
                </Typography>

                {/* Additional Photos Preview */}
                {testimonials[activeStep].additionalPhotos && 
                 testimonials[activeStep].additionalPhotos.length > 0 && (
                  <Box sx={{ mt: 2 }}>
                    <Box sx={{ display: "flex", gap: 1, justifyContent: 'center', flexWrap: 'wrap' }}>
                      {testimonials[activeStep].additionalPhotos.slice(0, 3).map((photoUrl, photoIndex) => (
                        <Box
                          key={photoIndex}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleImageClick(testimonials[activeStep], photoUrl, photoIndex);
                          }}
                          sx={{
                            width: { xs: 50, sm: 60 },
                            height: { xs: 50, sm: 60 },
                            borderRadius: 1,
                            overflow: "hidden",
                            cursor: "pointer",
                            border: "2px solid rgba(255,255,255,0.2)",
                            transition: "transform 0.2s ease",
                            "&:hover": {
                              transform: "scale(1.1)",
                              borderColor: "#FF9800",
                            },
                            flexShrink: 0
                          }}
                        >
                          <img
                            src={photoUrl}
                            alt={`Preview ${photoIndex + 1}`}
                            style={{
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                            }}
                          />
                        </Box>
                      ))}
                      {testimonials[activeStep].additionalPhotos.length > 3 && (
                        <Box
                          sx={{
                            width: { xs: 50, sm: 60 },
                            height: { xs: 50, sm: 60 },
                            borderRadius: 1,
                            backgroundColor: "rgba(255,152,0,0.2)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "#FF9800",
                            fontSize: "0.8rem",
                            fontWeight: "bold",
                          }}
                        >
                          +{testimonials[activeStep].additionalPhotos.length - 3}
                        </Box>
                      )}
                    </Box>
                  </Box>
                )}
              </CardContent>
            </Card>
          )}

          {/* Carousel Navigation */}
          <IconButton
            onClick={handleBack}
            sx={{
              position: 'absolute',
              left: { xs: -10, md: -20 },
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'white',
              backgroundColor: 'rgba(255,152,0,0.8)',
              '&:hover': {
                backgroundColor: '#FF9800',
              },
              zIndex: 2
            }}
          >
            <KeyboardArrowLeft />
          </IconButton>

          <IconButton
            onClick={handleNext}
            sx={{
              position: 'absolute',
              right: { xs: -10, md: -20 },
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'white',
              backgroundColor: 'rgba(255,152,0,0.8)',
              '&:hover': {
                backgroundColor: '#FF9800',
              },
              zIndex: 2
            }}
          >
            <KeyboardArrowRight />
          </IconButton>
        </Box>

        {/* Carousel Stepper */}
        <MobileStepper
          variant="dots"
          steps={Math.min(maxSteps, testimonials.length)}
          position="static"
          activeStep={activeStep}
          sx={{
            justifyContent: 'center',
            backgroundColor: 'transparent',
            mt: 2,
            '& .MuiMobileStepper-dot': {
              backgroundColor: 'rgba(255,255,255,0.3)',
              '&.MuiMobileStepper-dotActive': {
                backgroundColor: '#FF9800',
              }
            }
          }}
          nextButton={null}
          backButton={null}
        />

        {/* View All Button - Only show if there are more than 10 testimonials */}
        {allTestimonials.length > maxSteps && (
          <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
            <Button
              onClick={handleViewAll}
              variant="outlined"
              startIcon={<ViewCarousel />}
              sx={{
                color: "#FF9800",
                borderColor: "#FF9800",
                "&:hover": {
                  borderColor: "#FF5722",
                  backgroundColor: "rgba(255,152,0,0.1)",
                  transform: "translateY(-2px)",
                },
                transition: "all 0.3s ease",
                fontWeight: 600,
                px: 3,
                py: 1,
              }}
            >
              View All Testimonials ({allTestimonials.length})
            </Button>
          </Box>
        )}
      </Box>

      {/* All Testimonials Dialog */}
      <Dialog
        open={allTestimonialsDialogOpen}
        onClose={handleCloseDialogs}
        maxWidth="lg"
        fullWidth
        sx={{
          "& .MuiDialog-paper": {
            background: "rgba(0,0,0,0.95)",
            color: "white",
            backdropFilter: "blur(10px)",
            borderRadius: 2,
            maxHeight: '90vh',
            // Custom scrollbar for dialog
            '& ::-webkit-scrollbar': {
              width: '8px',
            },
            '& ::-webkit-scrollbar-track': {
              background: 'rgba(255,255,255,0.1)',
              borderRadius: '4px',
            },
            '& ::-webkit-scrollbar-thumb': {
              background: 'linear-gradient(45deg, #FF9800 30%, #FF5722 90%)',
              borderRadius: '4px',
            },
            '& ::-webkit-scrollbar-thumb:hover': {
              background: 'linear-gradient(45deg, #FF5722 30%, #FF9800 90%)',
            },
          },
        }}
      >
        <Box sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography
              variant="h4"
              sx={{
                fontFamily: "'AlanSans', sans-serif",
                fontWeight: 700,
                background: "linear-gradient(45deg, #FF9800 30%, #FF5722 90%)",
                backgroundClip: "text",
                WebkitBackgroundClip: "text",
                color: "transparent",
              }}
            >
              All Testimonials ({allTestimonials.length})
            </Typography>
            <IconButton
              onClick={handleCloseDialogs}
              sx={{
                color: "white",
                background: "rgba(0,0,0,0.5)",
                "&:hover": {
                  background: "rgba(255,0,0,0.5)",
                },
              }}
            >
              <Close />
            </IconButton>
          </Box>

          <Grid container spacing={3} sx={{ maxHeight: '70vh', overflow: 'auto', pr: 1 }}>
            {allTestimonials.map((testimonial, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Card
                  onClick={() => {
                    setSelectedTestimonial(testimonial);
                    setDetailDialogOpen(true);
                  }}
                  sx={{
                    background: "rgba(255,255,255,0.05)",
                    backdropFilter: "blur(10px)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: 2,
                    overflow: "hidden",
                    cursor: 'pointer',
                    transition: "transform 0.3s ease, box-shadow 0.3s ease",
                    "&:hover": {
                      transform: "translateY(-5px)",
                      boxShadow: "0 10px 30px rgba(255,152,0,0.3)",
                    },
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column'
                  }}
                >
                  <CardContent sx={{ p: 2, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                    <Box sx={{ display: "flex", alignItems: "center", mb: 1.5 }}>
                      <Box
                        sx={{
                          width: 50,
                          height: 50,
                          borderRadius: '50%',
                          overflow: 'hidden',
                          mr: 1.5,
                          border: '2px solid #FF9800',
                          flexShrink: 0
                        }}
                      >
                        <img
                          src={testimonial.photo || '/default-avatar.png'}
                          alt={testimonial.name}
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover'
                          }}
                          onError={(e) => {
                            e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIHZpZXdCb3g9IjAgMCA1MCA1MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjUiIGN5PSIyNSIgcj0iMjUiIGZpbGw9IiNGRjk4MDAiLz4KPHN2ZyB4PSIxMi41IiB5PSIxMi41IiB3aWR0aD0iMjUiIGhlaWdodD0iMjUiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0id2hpdGUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxwYXRoIGQ9Ik0xMiAxMmMyLjIxIDAgNC0xLjc5IDQtNHMtMS43OS00LTQtNC00IDEuNzktNCA0IDEuNzkgNCA0IDR6bTAgMmMtMi42NyAwLTggMS4zNC04IDR2MmgxNnYtMmMwLTIuNjYtNS4zMy00LTgtNHoiLz4KPC9zdmc+Cjwvc3ZnPg==';
                          }}
                        />
                      </Box>
                      <Box sx={{ flexGrow: 1 }}>
                        <Typography
                          variant="subtitle1"
                          sx={{
                            color: "#FFFF",
                            fontWeight: 600,
                            fontFamily: "'AlanSans', sans-serif",
                            fontSize: '0.9rem',
                            lineHeight: 1.2,
                            mb: 0.5
                          }}
                        >
                          {testimonial.name}
                        </Typography>
                        <Rating
                          value={testimonial.rating}
                          readOnly
                          size="small"
                          sx={{
                            color: "#FF9800",
                            "& .MuiRating-iconFilled": { color: "#FF9800" },
                          }}
                        />
                      </Box>
                    </Box>

                    <Typography
                      variant="body2"
                      sx={{
                        color: "rgba(255,255,255,0.9)",
                        lineHeight: 1.5,
                        textAlign: 'left',
                        flexGrow: 1,
                        mb: 1,
                        display: '-webkit-box',
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                      }}
                    >
                      <Box 
                        component="span" 
                        sx={{ 
                          color: '#FF9800', 
                          fontSize: '1rem',
                          verticalAlign: 'middle',
                          mr: 0.5
                        }}
                      >
                        "
                      </Box>
                      {truncateText(testimonial.comment, 120)}
                      <Box 
                        component="span" 
                        sx={{ 
                          color: '#FF9800', 
                          fontSize: '1rem',
                          verticalAlign: 'middle',
                          ml: 0.5
                        }}
                      >
                        "
                      </Box>
                    </Typography>

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 'auto' }}>
                      <Typography
                        variant="caption"
                        sx={{
                          color: "rgba(255,255,255,0.5)",
                        }}
                      >
                        {new Date(testimonial.timestamp).toLocaleDateString()}
                      </Typography>
                      
                      {testimonial.additionalPhotos && testimonial.additionalPhotos.length > 0 && (
                        <Chip
                          label={`${testimonial.additionalPhotos.length} 📸`}
                          size="small"
                          sx={{
                            height: 20,
                            fontSize: '0.6rem',
                            backgroundColor: 'rgba(255,152,0,0.2)',
                            color: '#FF9800'
                          }}
                        />
                      )}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      </Dialog>

      {/* Detail Dialog */}
      <Dialog
        open={detailDialogOpen}
        onClose={handleCloseDialogs}
        maxWidth="md"
        fullWidth
        sx={{
          "& .MuiDialog-paper": {
            background: "rgba(0,0,0,0.95)",
            color: "white",
            backdropFilter: "blur(10px)",
            borderRadius: 2,
            // Custom scrollbar for dialog
            '& ::-webkit-scrollbar': {
              width: '6px',
            },
            '& ::-webkit-scrollbar-track': {
              background: 'rgba(255,255,255,0.1)',
              borderRadius: '3px',
            },
            '& ::-webkit-scrollbar-thumb': {
              background: 'linear-gradient(45deg, #FF9800 30%, #FF5722 90%)',
              borderRadius: '3px',
            },
            '& ::-webkit-scrollbar-thumb:hover': {
              background: 'linear-gradient(45deg, #FF5722 30%, #FF9800 90%)',
            },
          },
        }}
      >
        {selectedTestimonial && (
          <>
            <IconButton
              onClick={handleCloseDialogs}
              sx={{
                position: "absolute",
                right: 8,
                top: 8,
                color: "white",
                background: "rgba(0,0,0,0.5)",
                "&:hover": {
                  background: "rgba(255,0,0,0.5)",
                },
                zIndex: 1000,
              }}
            >
              <Close />
            </IconButton>

            <CardContent sx={{ p: 3, maxHeight: '80vh', overflow: 'auto' }}>
              {/* Smaller Profile Photo Section */}
              <Box sx={{ display: "flex", alignItems: "flex-start", mb: 3 }}>
                <Box
                  sx={{
                    width: 60,
                    height: 60,
                    borderRadius: '50%',
                    overflow: 'hidden',
                    mr: 2,
                    border: '2px solid #FF9800',
                    flexShrink: 0
                  }}
                >
                  <img
                    src={selectedTestimonial.photo || '/default-avatar.png'}
                    alt={selectedTestimonial.name}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover'
                    }}
                  />
                </Box>
                <Box sx={{ flexGrow: 1 }}>
                  <Typography
                    variant="h6"
                    sx={{
                      color: "white",
                      fontWeight: 600,
                      fontFamily: "'AlanSans', sans-serif",
                      mb: 0.5,
                      fontSize: '1.25rem'
                    }}
                  >
                    {selectedTestimonial.name}
                  </Typography>
                  <Rating
                    value={selectedTestimonial.rating}
                    readOnly
                    size="small"
                    sx={{ color: "#FF9800", mb: 0.5 }}
                  />
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                    <Typography
                      variant="body2"
                      sx={{
                        color: "rgba(255,255,255,0.7)",
                      }}
                    >
                      {new Date(selectedTestimonial.timestamp).toLocaleDateString()}
                    </Typography>
                    {selectedTestimonial.source && (
                      <Chip
                        label={selectedTestimonial.source}
                        size="small"
                        sx={{
                          backgroundColor: 'rgba(255,152,0,0.2)',
                          color: '#FF9800',
                          height: 24,
                          fontSize: '0.75rem'
                        }}
                      />
                    )}
                  </Box>
                </Box>
              </Box>

              {/* Comment Text */}
              <Typography
                variant="body1"
                sx={{
                  color: "rgba(255,255,255,0.9)",
                  lineHeight: 1.7,
                  fontSize: '1rem',
                  mb: 3,
                  textAlign: 'left'
                }}
              >
                <Box 
                  component="span" 
                  sx={{ 
                    color: '#FF9800', 
                    fontSize: '1.5rem',
                    verticalAlign: 'middle',
                    mr: 0.5
                  }}
                >
                  "
                </Box>
                {selectedTestimonial.comment}
                <Box 
                  component="span" 
                  sx={{ 
                    color: '#FF9800', 
                    fontSize: '1.5rem',
                    verticalAlign: 'middle',
                    ml: 0.5
                  }}
                >
                  "
                </Box>
              </Typography>

              {/* Additional Photos in Detail Dialog */}
              {selectedTestimonial.additionalPhotos && 
               selectedTestimonial.additionalPhotos.length > 0 && (
                <Box sx={{ mt: 3 }}>
                  <Typography variant="subtitle1" sx={{ color: "white", mb: 2, fontSize: '1rem' }}>
                    Additional Photos ({selectedTestimonial.additionalPhotos.length})
                  </Typography>
                  <Box
                    sx={{
                      display: "grid",
                      gridTemplateColumns: { xs: "repeat(3, 1fr)", sm: "repeat(4, 1fr)", md: "repeat(5, 1fr)" },
                      gap: 1.5,
                    }}
                  >
                    {selectedTestimonial.additionalPhotos.map((photoUrl, photoIndex) => (
                      <Box
                        key={photoIndex}
                        onClick={() => handleImageClick(selectedTestimonial, photoUrl, photoIndex)}
                        sx={{
                          cursor: "pointer",
                          borderRadius: 1.5,
                          overflow: "hidden",
                          transition: "transform 0.2s ease",
                          "&:hover": {
                            transform: "scale(1.05)",
                          },
                          aspectRatio: "1",
                          border: "2px solid rgba(255,255,255,0.2)",
                        }}
                      >
                        <img
                          src={photoUrl}
                          alt={`Additional photo ${photoIndex + 1}`}
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                          }}
                        />
                      </Box>
                    ))}
                  </Box>
                </Box>
              )}
            </CardContent>
          </>
        )}
      </Dialog>

      {/* Image Dialog */}
      <Dialog
        open={imageDialogOpen}
        onClose={handleCloseDialogs}
        maxWidth="lg"
        fullWidth
        sx={{
          "& .MuiDialog-paper": {
            background: "rgba(0,0,0,0.99)",
            color: "white",
            // Custom scrollbar for image dialog
            '& ::-webkit-scrollbar': {
              width: '6px',
            },
            '& ::-webkit-scrollbar-track': {
              background: 'rgba(255,255,255,0.1)',
              borderRadius: '3px',
            },
            '& ::-webkit-scrollbar-thumb': {
              background: 'linear-gradient(45deg, #FF9800 30%, #FF5722 90%)',
              borderRadius: '3px',
            },
          },
        }}
      >
        {selectedImage && selectedTestimonial && (
          <>
            <IconButton
              onClick={handleCloseDialogs}
              sx={{
                position: "absolute",
                right: 8,
                top: 8,
                color: "white",
                background: "rgba(0,0,0,0.5)",
                "&:hover": {
                  background: "rgba(255,0,0,0.5)",
                },
                zIndex: 1000,
              }}
            >
              <Close />
            </IconButton>

            <IconButton
              onClick={handlePrevImage}
              sx={{
                position: "absolute",
                left: 8,
                top: "50%",
                transform: "translateY(-50%)",
                color: "white",
                background: "rgba(0,0,0,0.5)",
                "&:hover": {
                  background: "rgba(255,152,0,0.5)",
                },
                zIndex: 1000,
              }}
            >
              <NavigateBefore />
            </IconButton>

            <IconButton
              onClick={handleNextImage}
              sx={{
                position: "absolute",
                right: 8,
                top: "50%",
                transform: "translateY(-50%)",
                color: "white",
                background: "rgba(0,0,0,0.5)",
                "&:hover": {
                  background: "rgba(255,152,0,0.5)",
                },
                zIndex: 1000,
              }}
            >
              <NavigateNext />
            </IconButton>

            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                p: 2,
                minHeight: "400px",
                backgroundColor: "rgba(255,255,255,0.1)",
              }}
            >
              <img
                src={selectedImage}
                alt="Enlarged view"
                style={{
                  maxWidth: "100%",
                  maxHeight: "70vh",
                  objectFit: "contain",
                }}
              />
            </Box>

            <Box sx={{ p: 2, borderTop: "1px solid rgba(255,255,255,0.1)" }}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <Box>
                  <Typography
                    variant="h6"
                    sx={{
                      color: "white",
                      fontFamily: "'AlanSans', sans-serif",
                    }}
                  >
                    {selectedTestimonial.name}
                  </Typography>
                  <Rating
                    value={selectedTestimonial.rating}
                    readOnly
                    size="small"
                    sx={{ color: "#FF9800" }}
                  />
                </Box>
                <Chip
                  label={`${currentImageIndex + 1} / ${
                    (selectedTestimonial.additionalPhotos || []).length
                  }`}
                  sx={{ color: "white", background: "rgba(255,152,0,0.3)" }}
                />
              </Box>
              <Typography
                variant="body2"
                sx={{ color: "rgba(255,255,255,0.8)", mt: 1 }}
              >
                {selectedTestimonial.comment}
              </Typography>
            </Box>
          </>
        )}
      </Dialog>

      {testimonials.length === 0 && !loading && (
        <Box sx={{ textAlign: "center", mt: 4 }}>
          <Typography variant="h6" sx={{ color: "rgba(255,255,255,0.7)" }}>
            No testimonials yet. Be the first to share your experience!
          </Typography>
        </Box>
      )}
    </Box>
    </div>

    
  );
};

export default Testimonial;