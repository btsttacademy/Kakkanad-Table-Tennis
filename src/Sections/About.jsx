import { LiaTableTennisSolid } from "react-icons/lia";
import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
} from "@mui/material";
import { Close } from "@mui/icons-material";

const About = ({
  aboutHeading,
  aboutDescription,
  feature1Heading,
  feature1Description,
  feature2Heading,
  feature2Description,
  coachingHeading,
  coachingDescription,
  groupCoachingHeading,
  groupCoachingDescription,
  price,
  timing1Heading,
  timing1Description,
  timing2Heading,
  timing2Description,
  img1,
  img2,
  img3,
}) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [imageErrors, setImageErrors] = useState({});
  const [imageUrls, setImageUrls] = useState({});

  useEffect(() => {
    // Log the received image props for debugging
    console.log('Image props received:', { img1, img2, img3 });
    
    // Process each image URL
    const processImageUrl = (url, key) => {
      if (!url) {
        console.log(`${key} is empty or undefined`);
        return '';
      }
      
      console.log(`Processing ${key}:`, url);
      
      // Check if it's a Google Drive link
      if (url.includes('drive.google.com')) {
        console.log(`${key} is a Google Drive link`);
        
        // Try multiple Google Drive URL formats
        let fileId = '';
        
        // Format 1: /file/d/FILE_ID/view
        const fileMatch = url.match(/\/d\/([^\/]+)/);
        if (fileMatch) {
          fileId = fileMatch[1];
          console.log(`${key} - Extracted fileId from /d/ format:`, fileId);
        }
        
        // Format 2: id=FILE_ID
        const idMatch = url.match(/[?&]id=([^&]+)/);
        if (idMatch) {
          fileId = idMatch[1];
          console.log(`${key} - Extracted fileId from id= format:`, fileId);
        }
        
        // Format 3: Extract from the specific link you provided
        // https://drive.google.com/file/d/16v6yc_ZfubXTpO2zs6GIEwS2RZbKJwQB/view?usp=sharing
        if (url.includes('/file/d/')) {
          const parts = url.split('/file/d/');
          if (parts.length > 1) {
            const idPart = parts[1].split('/')[0];
            fileId = idPart;
            console.log(`${key} - Extracted fileId from /file/d/ format:`, fileId);
          }
        }
        
        if (fileId) {
          // Try different Google Drive image serving formats
          const formats = [
            `https://drive.google.com/uc?export=view&id=${fileId}`,  // Standard export
            `https://drive.google.com/thumbnail?id=${fileId}`,        // Thumbnail format
            `https://lh3.googleusercontent.com/d/${fileId}`,          // Google user content
          ];
          
          console.log(`${key} - Generated URL formats:`, formats);
          return formats[0]; // Return first format, we'll try others on error
        }
      }
      
      return url;
    };
    
    setImageUrls({
      img1: processImageUrl(img1, 'img1'),
      img2: processImageUrl(img2, 'img2'),
      img3: processImageUrl(img3, 'img3'),
    });
  }, [img1, img2, img3]);

  const handleOpenDialog = () => {
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
  };

  const handleImageError = (imgNumber, attemptedUrl) => {
    console.log(`Image ${imgNumber} failed to load:`, attemptedUrl);
    
    // Try alternative Google Drive formats if this is a Google Drive URL
    if (attemptedUrl.includes('drive.google.com') || attemptedUrl.includes('googleusercontent')) {
      const fileId = extractFileIdFromUrl(attemptedUrl);
      if (fileId) {
        // Try different format
        const currentFormat = imageUrls[imgNumber];
        let newUrl = '';
        
        if (currentFormat.includes('uc?export=view')) {
          newUrl = `https://drive.google.com/thumbnail?id=${fileId}`;
        } else if (currentFormat.includes('thumbnail')) {
          newUrl = `https://lh3.googleusercontent.com/d/${fileId}`;
        } else {
          newUrl = `https://drive.google.com/uc?export=view&id=${fileId}`;
        }
        
        console.log(`Trying alternative format for ${imgNumber}:`, newUrl);
        
        setImageUrls(prev => ({
          ...prev,
          [imgNumber]: newUrl
        }));
        
        // Don't mark as error yet, let's try the new URL
        return;
      }
    }
    
    // If all attempts fail, mark as error
    setImageErrors(prev => ({ ...prev, [imgNumber]: true }));
  };

  const extractFileIdFromUrl = (url) => {
    const patterns = [
      /id=([^&]+)/,
      /\/d\/([^\/]+)/,
      /\/thumbnail\?id=([^&]+)/,
      /googleusercontent\.com\/d\/([^\/]+)/
    ];
    
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) {
        return match[1];
      }
    }
    return null;
  };

  return (
    <div id="about" className="py-20 ">
      <div className="flex max-[750px]:flex-col bg-gray-50 rounded-xl p-5 gap-5">
        <div className="flex-1 flex flex-col gap-4">
          <p className="font-riope text-[35px] leading-9 text-black/90">
            {aboutHeading}
          </p>
          <p className="font-in">{aboutDescription}</p>
          <button
            onClick={handleOpenDialog}
            className="flex px-4 py-2 text-sm tracking-wide font-semibold w-[150px]
              text-orange-500
              border
              border-orange-500
              hover:shadow-xl
              active:shadow-md
              rounded-lgf 
              transition-all
              duration-300
              ease-out
              transform
              gap-2 justify-center
              hover:bg-orange-500
              hover:text-white
              active:scale-95
              overflow-hidden"
          >
            Read More <LiaTableTennisSolid className="text-[20px]" />
          </button>
        </div>
        <div className="flex-1 flex gap-2">
          <div className="flex-1 rounded-lg max-[750px]:h-[400px] overflow-hidden">
            {!imageErrors.img1 ? (
              <img 
                src={imageUrls.img1 || img1} 
                alt="Table tennis 1"
                className="w-full h-full object-cover"
                onError={(e) => handleImageError('img1', e.target.src)}
              />
            ) : (
              <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                <span className="text-gray-500">Image not available</span>
              </div>
            )}
          </div>
          <div className="flex-1 flex gap-2 flex-col">
            <div className="rounded-lg flex-1 overflow-hidden">
              {!imageErrors.img2 ? (
                <img 
                  src={imageUrls.img2 || img2} 
                  alt="Table tennis 2"
                  className="w-full h-full object-cover"
                  onError={(e) => handleImageError('img2', e.target.src)}
                />
              ) : (
                <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-500">Image not available</span>
                </div>
              )}
            </div>
            <div className="rounded-lg flex-1 overflow-hidden">
              {!imageErrors.img3 ? (
                <img 
                  src={imageUrls.img3 || img3} 
                  alt="Table tennis 3"
                  className="w-full h-full object-cover"
                  onError={(e) => handleImageError('img3', e.target.src)}
                />
              ) : (
                <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-500">Image not available</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Dialog Box - rest of your code remains the same */}
      <Dialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
        scroll="paper"
        sx={{
          "& .MuiDialog-paper": {
            borderRadius: "16px",
            padding: "8px",
          },
        }}
      >
        <DialogTitle
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "16px 24px 8px 24px",
            backgroundColor: "#f8f9fa",
            borderBottom: "1px solid #e9ecef",
          }}
        >
          <span className="font-riope text-2xl text-orange-600">
            BT's TT Academy Details
          </span>
          <IconButton
            onClick={handleCloseDialog}
            size="small"
            sx={{
              color: "#6c757d",
              "&:hover": {
                backgroundColor: "rgba(0,0,0,0.04)",
              },
            }}
          >
            <Close />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ padding: "24px" }}>
          <div className="font-in gap-4 flex flex-col">
            <div className="mb-4">
              <div className="font-riope text-xl mb-3 text-gray-800">
                BT's TT Academy
              </div>
              <p className="mb-4 text-gray-700">
                🧠 My warm-up and cool-down exercises are uniquely designed
                using techniques learned from:
              </p>
              <div className="space-y-2 ml-4">
                <p className="text-gray-600">
                  • NCC Army Wing Senior Under Officer ("C" Certificate Holder)
                </p>
                <p className="text-gray-600">
                  • Multi-sport experience including Kho-Kho, Kabaddi, Handball,
                  and Table Tennis
                </p>
                <p className="text-gray-600">
                  • Chinese Kung Fu (Blue Belt Holder from "Shaolin Jackie Chan
                  Martial Arts Academy")
                </p>
              </div>
            </div>

            <div className="mb-4">
              <p className="text-gray-700">
                If you are looking to elevate your TT game, I bring a unique mix
                of corporate experience, sports discipline, and mentoring
                passion to help you reach your goals with confidence.
              </p>
            </div>

            <div className="mb-4">
              <h1 className="text-lg font-semibold text-gray-800 mb-3 underline">
                {feature1Heading}
              </h1>
              <p className="mb-3 text-gray-700">
                {feature1Description}
              </p>
              </div>

            <div className="mb-4">
              <h1 className="text-lg font-semibold text-gray-800 mb-3 underline">
                {feature2Heading}
              </h1>
              <p className="mb-3 text-gray-700">
                {feature2Description}
              </p>
              <p className="mb-3 text-gray-700">
                <strong>{coachingHeading}</strong> {coachingDescription}
              </p>
              <p className="mb-3 text-gray-700">
                <strong>
                  {groupCoachingHeading}
                </strong>
               {groupCoachingDescription}
              </p>
            </div>

            <div className="mb-4 p-3 bg-orange-50 rounded-lg border border-orange-200">
              <p className="font-semibold text-orange-800 text-sm">
               {price}
              </p>
            </div>

            <div className="mb-2">
              <p className="font-semibold text-gray-800 mb-2">
                My TT Coaching Timings:
              </p>
              <div className="space-y-1 ml-4">
                <p className="text-gray-700">
                  <strong>{timing1Heading}</strong>{timing1Description}
                </p>
                <p className="text-gray-700">
                  <strong>{timing2Heading}</strong>{timing2Description}
                </p>
              </div>
            </div>

            <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-blue-800 text-sm font-medium">
                📞 For bookings and inquiries, please contact us via the contact
                form or email to btsttacademy@gmail.com.
              </p>
            </div>
          </div>
        </DialogContent>

        <DialogActions
          sx={{ padding: "16px 24px", borderTop: "1px solid #e9ecef" }}
        >
          <Button
            onClick={handleCloseDialog}
            variant="contained"
            sx={{
              backgroundColor: "#f97316",
              "&:hover": {
                backgroundColor: "#ea580c",
              },
              textTransform: "none",
              fontWeight: "600",
              padding: "8px 24px",
              borderRadius: "8px",
            }}
            autoFocus
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default About;