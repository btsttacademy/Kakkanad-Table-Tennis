import React, { useState } from "react";
import { Avatar } from "@mui/material";

const UserAvatar = ({ photoUrl, name }) => {
  const [imgError, setImgError] = useState(false);

  // Show image only if url exists and no error occurred
  const showImage = photoUrl && !imgError;

  return (
    <Avatar
      src={showImage ? photoUrl : undefined}
      alt={name}
      onError={() => setImgError(true)}
      sx={{ width: 48, height: 48, mr: 2, border: "2px solid #FF9800" }}
    >
      {!showImage && name ? name.charAt(0).toUpperCase() : null}
    </Avatar>
  );
};

export default UserAvatar;
