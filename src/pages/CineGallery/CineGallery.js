import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Modal from 'react-modal';

// Make sure you have installed axios and react-modal packages

const CineGallery = () => {
  const [videos, setVideos] = useState([]);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState(null);

  useEffect(() => {
    const fetchVideos = async () => {
      const accessToken = process.env.REACT_APP_VIMEO_ACCESS_TOKEN; // Access token from environment variable
      const options = {
        headers: {
          Authorization: `bearer ${accessToken}`, // Use the access token
        },
      };

      // Replace 'user123456' with your actual Vimeo user ID
      const response = await axios.get('https://api.vimeo.com/users/3990217/videos', options);
      setVideos(response.data.data);
    };

    fetchVideos();
  }, []);

  const openModal = (video) => {
    setSelectedVideo(video);
    setModalIsOpen(true);
  };

  return (
    <div>
      {videos.map((video) => (
        <img
          key={video.uri}
          src={video.pictures.sizes[0].link}
          alt={video.name}
          onClick={() => openModal(video)}
        />
      ))}

      <Modal isOpen={modalIsOpen} onRequestClose={() => setModalIsOpen(false)}>
        {selectedVideo && (
          <iframe
            title={selectedVideo.name}
            src={`https://player.vimeo.com/video/${selectedVideo.uri.split('/').pop()}`}
            width="640"
            height="360"
            frameborder="0"
            allow="autoplay; fullscreen"
            allowfullscreen
          ></iframe>
        )}
      </Modal>
    </div>
  );
};

export default CineGallery;
