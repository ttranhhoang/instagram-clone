import { Box, Button, LinearProgress, Typography } from "@mui/material";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";
import PropTypes from "prop-types";
import React, { useState } from "react";
import { db, storage } from "./firebase";
import "./ImageUpload.css";

function LinearProgressWithLabel(props) {
  return (
    <Box display="flex" alignItems="center">
      <Box width="100%" mr={1}>
        <LinearProgress variant="determinate" {...props} />
      </Box>
      <Box minWidth={35}>
        <Typography variant="body2" color="textSecondary">{`${Math.round(
          props.value
        )}%`}</Typography>
      </Box>
    </Box>
  );
}
LinearProgressWithLabel.propTypes = {
  /**
   * The value of the progress indicator for the determinate and buffer variants.
   * Value between 0 and 100.
   */
  value: PropTypes.number.isRequired,
};

function ImageUpload({ username }) {
  const [image, setImage] = useState(null);
  const [progress, setProgress] = useState(0);
  const [caption, setCaption] = useState("");

  const handleChange = (e) => {
    if (e.target.files[0]) {
      setImage(e.target.files[0]);
    }
  };

  const handleUpload = () => {
    const storageRef = ref(storage, `images/${image.name}`);

    const uploadTask = uploadBytesResumable(storageRef, image);
    uploadTask.on(
      "state_changed",
      (snapshot) => {
        // thanh phần trăm chạy...
        // const timer = setInterval(() =>{
        //     setProgress((prevProgress) => (prevProgress >= 100 ? 10 : prevProgress + 10));
        // },800);
        const progress = Math.round(
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100
        );
        setProgress(progress);
        // return () => {
        //     clearInterval(timer);
        // };
      },
      (error) => {
        console.log(error);
        alert(error.message);
      },
      () => {
        // đăng thành công

        getDownloadURL(uploadTask.snapshot.ref).then((url) => {
          addDoc(collection(db, "posts"), {
            // timestamp: firebase.firestore.FieldValue.serverTimestamp(),
            timestamp: serverTimestamp(),
            caption: caption,
            imageURL: url,
            username: username,
          });
          setProgress(0);
          setCaption("");
          setImage(null);
          // storage
          //   .ref("images")
          //   .child(image.name)
          //   .getDownloadURL()
          //   .then((url) => {
          //     // đưa vào database
          //     addDoc(collection(db, "posts"),{
          //       // timestamp: firebase.firestore.FieldValue.serverTimestamp(),
          //       timestamp: serverTimestamp(),
          //       caption: caption,
          //       imageURL: url,
          //       username: username,
          //     });
          //     setProgress(0);
          //     setCaption("");
          //     setImage(null);
        });
      }
    );
  };

  return (
    <div className="imageupload">
      <LinearProgressWithLabel
        className="imageupload_progress"
        value={progress}
        max="100"
      />
      <input
        type="text"
        placeholder="Enter caption"
        onChange={(event) => setCaption(event.target.value)}
        value={caption}
      />
      <input type="file" onChange={handleChange} />
      <Button onClick={handleUpload}>Upload</Button>
    </div>
  );
}

export default ImageUpload;
