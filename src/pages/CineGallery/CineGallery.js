import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Modal from 'react-modal';
import { Carousel } from 'react-responsive-carousel';
import "react-responsive-carousel/lib/styles/carousel.min.css"; // Import carousel CSS
import FooterShowcase from '../../components/FooterShowcase/FooterShowcase'; // Update the path as needed
import './CineGallery.css'; // Make sure this CSS file exists for styling

Modal.setAppElement('#root'); // Important for accessibility

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

      try {
        // Here you fetch videos from your specific Vimeo folder
        const response = await axios.get(`https://api.vimeo.com/users/3990217/albums/11002496/videos`, options);
        setVideos(response.data.data);
      } catch (error) {
        console.error('Error fetching videos', error);
      }
    };

    fetchVideos();
  }, []);

  const openModal = (video) => {
    setSelectedVideo(video);
    setModalIsOpen(true);
  };

  return (
    <>
      <Carousel autoPlay infiniteLoop showThumbs={false} showStatus={false}>
        {/* Make sure these image paths are correct */}
        <div>
          <img src="/assets/gallery/GA Wedding Video.png" alt="GA Wedding Video" />
        </div>
        <div>
          <img src="/assets/gallery/Ar Wedding Video.png" alt="Ar Wedding Video" />
        </div>
        <div>
          <img src="/assets/gallery/NorthWest Arkansas Wedding Videographer.png" alt="NorthWest Arkansas Wedding Videographer" />
        </div>
        <div>
          <img src="/assets/gallery/NorthWest Arkansas Wedding Videography.png" alt="NorthWest Arkansas Wedding Videography" />
        </div>
        {/* Add more slides as needed */}
      </Carousel>
      <div className="cine-gallery-container">
        {videos.map((video) => (
          <div key={video.uri} className="video-thumbnail" onClick={() => openModal(video)}>
            <img src={video.pictures.sizes[3].link} alt={video.name} />
          </div>
        ))}
      </div>
      <Modal 
        isOpen={modalIsOpen} 
        onRequestClose={() => setModalIsOpen(false)}
        contentLabel="Video Modal"
        className="video-modal"
        overlayClassName="video-modal-overlay"
      >
        {selectedVideo && (
          <iframe
            title={selectedVideo.name}
            src={`https://player.vimeo.com/video/${selectedVideo.uri.split('/').pop()}`}
            width="640"
            height="360"
            frameBorder="0"
            allow="autoplay; fullscreen"
            allowFullScreen
          ></iframe>
        )}
      </Modal>
      <FooterShowcase />
    </>
  );
};

export default CineGallery;
