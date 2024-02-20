import React, { useState, useEffect, useRef } from 'react';
import { getDatabase, ref, onValue, off, push, set } from 'firebase/database';
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { app, db, storage } from './firebase';
import './Feed.css';

function Feed() {
  const [feedEntries, setFeedEntries] = useState([]);
  const [scrollingInterval, setScrollingInterval] = useState(null);

  const handleChildUpload = async (childInfo) => {
    try {
      const storageReference = storageRef(storage, `child_photos/${childInfo.photoFile.name}`);
      await uploadBytes(storageReference, childInfo.photoFile);

      const photoURL = await getDownloadURL(storageReference);

      const newEntry = {
        id: Date.now(),
        ...childInfo,
        photo: photoURL,
      };

      const childEntriesRef = ref(db, 'childEntries');
      const newChildRef = push(childEntriesRef);
      set(newChildRef, newEntry);
    } catch (error) {
      console.error('Error uploading file:', error);
    }
  };

  const scrollingFeedRef = useRef(null);

  useEffect(() => {
    const childEntriesRef = ref(db, 'children');

    const onDataChange = (snapshot) => {
      const entries = [];
      snapshot.forEach((childSnapshot) => {
        entries.push({
          id: childSnapshot.key,
          ...childSnapshot.val(),
        });
      });
      setFeedEntries(entries.reverse());
    };

    onValue(childEntriesRef, onDataChange);

    const scrollingFeed = scrollingFeedRef.current;
    let scrollPosition = 0;

    const scrollFeed = () => {
      if (scrollPosition >= scrollingFeed.scrollHeight - scrollingFeed.clientHeight) {
        scrollPosition = 0;
      }
      scrollingFeed.scrollTop = scrollPosition;
      scrollPosition += 1;
    };

    const scrollInterval = setInterval(scrollFeed,1);

    return () => {
      off(childEntriesRef, 'value', onDataChange);
      clearInterval(scrollInterval);
    };
  }, []);

  useEffect(() => {
    const fetchImages = async () => {
      for (const entry of feedEntries) {
        try {
          const response = await fetch(`http://localhost:3001/image/${encodeURIComponent(entry.photoURL)}`);
          const blob = await response.blob();
          const imageUrl = URL.createObjectURL(blob);

          // Update the state with the fetched image URL
          setFeedEntries((prevEntries) =>
            prevEntries.map((prevEntry) =>
              prevEntry.id === entry.id ? { ...prevEntry, imageUrl } : prevEntry
            )
          );
        } catch (error) {
          console.error('Error fetching image:', error);
        }
      }
    };

    fetchImages();

    // Fetch images every 60 seconds
    const imageFetchInterval = setInterval(fetchImages, 60000);

    return () => clearInterval(imageFetchInterval);
  }, [feedEntries]);

  return (
    <div className="feed">
      <div className='feed-head'>
        <h1 id='scrolling-header'>Recently missing</h1>
      </div>
      <div className="scrolling-feed" ref={scrollingFeedRef}>
        {feedEntries.map((entry) => (
          <div className="feed-entry" key={entry.id}>
            <h2>{entry.name}</h2>
            <p>Age: {entry.age}</p>
            <p>Gender: {entry.gender}</p>
            <p>Last Location: {entry.lastLocation}</p>
            <img src={entry.imageUrl} alt={entry.name} />
          </div>
        ))}
      </div>
    </div>
  );
}

export default Feed;
