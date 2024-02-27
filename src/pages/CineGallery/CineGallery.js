import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Modal from 'react-modal';
import { Carousel } from 'react-responsive-carousel';
import "react-responsive-carousel/lib/styles/carousel.min.css"; // Import carousel CSS
import FooterShowcase from '../../components/FooterShowcase/FooterShowcase';
import './CineGallery.css';

Modal.setAppElement('#root'); // Important for accessibility


const CineGallery = () => {
  const [videos, setVideos] = useState([]);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [selectedVideoUrl, setSelectedVideoUrl] = useState('');

  const carouselVideos = [
    { img: "/assets/gallery/GA Wedding Video.png", videoUrl: "https://vimeo.com/735641625" },
    { img: "/assets/gallery/Ar Wedding Video.png", videoUrl: "https://vimeo.com/751499247" },
    { img: "/assets/gallery/NorthWest Arkansas Wedding Videographer.png", videoUrl: "https://vimeo.com/739310663" },
    { img: "/assets/gallery/NorthWest Arkansas Wedding Videography.png", videoUrl: "https://vimeo.com/506883833" },
  ];

  useEffect(() => {
    const fetchVideos = async () => {
        const accessToken = process.env.REACT_APP_VIMEO_ACCESS_TOKEN;
        const options = {
          headers: { Authorization: `bearer ${accessToken}` },
        };
        let allVideos = [];
        let currentPage = 1;
        const perPage = 50; // Adjust based on your needs, up to the max allowed by Vimeo
        let totalPages = 1; // Placeholder, will be updated based on response
      
        try {
          // Initial fetch to get the first page and total page count
          let response = await axios.get(`https://api.vimeo.com/users/3990217/albums/11002496/videos?page=${currentPage}&per_page=${perPage}`, options);
          allVideos = response.data.data;
          const totalItems = response.data.total; // Total number of videos
          totalPages = Math.ceil(totalItems / perPage);
      
          // Fetch remaining pages if more than one page
          for (currentPage = 2; currentPage <= totalPages; currentPage++) {
            response = await axios.get(`https://api.vimeo.com/users/3990217/albums/11002496/videos?page=${currentPage}&per_page=${perPage}`, options);
            allVideos = [...allVideos, ...response.data.data]; // Combine results
          }
        } catch (error) {
          console.error('Error fetching videos', error);
        }
      
        setVideos(allVideos); // Update state with all fetched videos
      };

    fetchVideos();
  }, []);

  const openModal = (videoUrl) => {
    // If videoUrl is a direct Vimeo link, convert it to an embed URL.
    const embedUrl = videoUrl.replace('vimeo.com/', 'player.vimeo.com/video/');
    setSelectedVideoUrl(embedUrl);
    setModalIsOpen(true);
  };
  
  

  return (
    <>
    <Carousel autoPlay infiniteLoop showThumbs={false} showStatus={false}>
  {carouselVideos.map((video, index) => (
    <div key={index} onClick={() => openModal(video.videoUrl)}>
      <img src={video.img} alt={`Carousel Video ${index + 1}`} />
    </div>
  ))}
</Carousel>


      <div className="cine-gallery-container">
        {videos.map((video) => (
          <div key={video.uri} className="video-thumbnail" onClick={() => openModal(`https://player.vimeo.com/video/${video.uri.split('/').pop()}`)}>
            <img src={video.pictures.sizes[3].link} alt={video.name} />
          </div>
        ))}
      </div>
      <Modal 
  isOpen={modalIsOpen} 
  onRequestClose={() => setModalIsOpen(false)}
  contentLabel="Video Modal"
  className="video-modal" // This should match your CSS class for modal styling
  overlayClassName="video-modal-overlay" // This should match your CSS class for the overlay styling
>
  {selectedVideoUrl && (
    <iframe
      title="Selected Video"
      src={selectedVideoUrl}
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
