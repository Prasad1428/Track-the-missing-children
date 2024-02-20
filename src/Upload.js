import React, { useState } from 'react';
import { db } from './firebase'; // Import Firebase RTDB
import { set, ref as rtdbRef, push as rtdbPush } from 'firebase/database'; // Import RTDB functions
import './Upload.css';

function Upload({ onChildUpload }) {
  const [childInfo, setChildInfo] = useState({
    name: '',
    age: '',
    gender: '',
    lastLocation: '',
    photoFile: null, // Store the selected file
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setChildInfo({ ...childInfo, [name]: value });
  };

  const handleFileInputChange = (e) => {
    const file = e.target.files[0];
    setChildInfo({ ...childInfo, photoFile: file });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Upload the selected file to the server (Express backend)
      const formData = new FormData();
      formData.append('photo', childInfo.photoFile);

      const response = await fetch('http://localhost:3001/upload', {
        method: 'POST',
        body: formData,
      });

      const imagePath = await response.text();

      // Store child information in RTDB with the local file path
      const rtdbRefPath = `children`;
      const rtdbChildRef = rtdbPush(rtdbRef(db, rtdbRefPath));

      await set(rtdbChildRef, {
        name: childInfo.name,
        age: childInfo.age,
        gender: childInfo.gender,
        lastLocation: childInfo.lastLocation,
        photoURL: imagePath, // Store the local file path in RTDB
      });

      // Reset form
      setChildInfo({
        name: '',
        age: '',
        gender: '',
        lastLocation: '',
        photoFile: null, // Reset the file input
      });
    } catch (error) {
      console.error('Error uploading child info:', error);
    }
  };

  return (
    <div className='upload'>
      <div className='img-container'>
        <div className='overlay'></div>
        <img className='side-img' src='children.jpg' alt='Children'></img>
      </div>

      <div className='child-upload-form'>
        <h2>Upload Missing Child Information</h2>
        <form onSubmit={handleSubmit}>
          <input
            type='text'
            name='name'
            placeholder='Name'
            value={childInfo.name}
            onChange={handleInputChange}
            required
          />
          <input
            type='text'
            name='age'
            placeholder='Age'
            value={childInfo.age}
            onChange={handleInputChange}
            required
          />
          <input
            type='text'
            name='gender'
            placeholder='Gender'
            value={childInfo.gender}
            onChange={handleInputChange}
            required
          />
          <input
            type='text'
            name='lastLocation'
            placeholder='Last Location'
            value={childInfo.lastLocation}
            onChange={handleInputChange}
            required
          />
          <input
            type='file' // Use file input for file selection
            accept='image/*' // Accept image files
            onChange={handleFileInputChange}
            required
          />
          <button type='submit'>Upload</button>
        </form>
      </div>
    </div>
  );
}

export default Upload;
