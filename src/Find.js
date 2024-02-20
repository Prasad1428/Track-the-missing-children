import React, { useState,useEffect} from 'react';
import axios from 'axios';
import { db,storage } from './firebase'; // Import Firebase Storage
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'; // Import Firebase Storage functions
import { getDatabase, ref as ref2,get} from 'firebase/database';

import './Find.css';
import Feed from './Feed';


function Find() {
  const [imagePreview, setImagePreview] = useState(null);
  const [file, setFile] = useState(null);
  const [childrenData, setChildrenData] = useState([]);

  useEffect(() => {
    // Fetch children data from your Firebase Realtime Database
    const fetchChildrenData = async () => {
      try {
        // Replace 'https://finalyear-cfd4a-default-rtdb.firebaseio.com/' with your actual Firebase URL
        const response = await fetch('https://finalyear-cfd4a-default-rtdb.firebaseio.com/children.json');
        const data = await response.json();

        if (data) {
          // Convert object to an array of child objects
          const childrenArray = Object.values(data);
          setChildrenData(childrenArray);
        } else {
          console.error('No data found in the "children" database.');
        }
      } catch (error) {
        console.error('Error fetching children data:', error);
      }
    };

    fetchChildrenData();
    console.log(childrenData)
  },[]);

  const handleImageChange = (e) => {
    const selectedFile = e.target.files[0];

    if (selectedFile) {
      setFile(selectedFile);

      const reader = new FileReader();

      reader.onloadend = () => {
        const img = new Image();
        img.src = reader.result;

        img.onload = () => {
          const scaleFactor = 1 / 5; // Scale down by a factor of 5
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');

          const newWidth = img.width * scaleFactor;
          const newHeight = img.height * scaleFactor;

          canvas.width = newWidth;
          canvas.height = newHeight;

          ctx.drawImage(img, 0, 0, newWidth, newHeight);

          const scaledImageDataUrl = canvas.toDataURL('image/jpeg'); // Adjust format as needed

          setImagePreview(scaledImageDataUrl);
        };
      };

      reader.readAsDataURL(selectedFile);
    } else {
      setImagePreview(null);
      setFile(null);
    }
  };
  const cancelImage=()=>{
    setImagePreview(null);
  }
  const handleSubmit = async (e) => {
    e.preventDefault();
    try { 
      // Upload the selected file to the server (Express backend)
      const formData = new FormData();
      console.log(file)
      formData.append('file',file);
      formData.append('childrenData', JSON.stringify(childrenData)); 

      const response = await fetch('http://localhost:3001/find', {
        method: 'POST',
        body: formData,
      });

      const imagePath = await response.text();
      console.log(imagePath)
    } catch (error) {
      console.error('Error uploading child info:', error);
    }
  };

  return (
    <div className='Find'>
      {imagePreview ? (
        <div className='container'>
          <div className='container-em'>
            <img src={imagePreview} alt="Preview" id='previewImg'/>
          </div>
          <div className='container-em'>
            <button type='button' className='submitImage' onClick={handleSubmit}>
              Submit
            </button>
            <button type='button' className='cancelImage' onClick={cancelImage}>
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className='container'>
          <div className='container-em'>
          <h2>Upload to find.</h2>
            <img src='file.png' id='demo-img' alt="img" />
          </div>
          <div className='container-em'>
            <input
              className='initialDiv'
              type="file"
              id="upload-image"
              accept="image/*"
              onChange={handleImageChange}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default Find;
