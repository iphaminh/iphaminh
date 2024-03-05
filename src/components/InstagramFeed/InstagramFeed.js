import React from 'react';
import './InstagramFeed.css';

const InstagramFeed = () => {
  const thumbnails = [
    { src: '/assets/pricing/arkansas-wedding-venue-overview-phaminh-photography.png', link: 'https://www.instagram.com/p/C3DZtb8L92H/' },
    { src: '/assets/pricing/georgia-wedding-floral-arrangements-phaminh-videography.png', link: 'https://www.instagram.com/p/C2xc8_vL8xF/' },
    { src: '/assets/pricing/phaminh-arkansas-bridal-entrance-cinematography.png', link: 'https://www.instagram.com/p/Co1FEBcsMXP/' },
    { src: '/assets/pricing/phaminh-romantic-sunset-vows-georgia-wedding.png', link: 'https://www.instagram.com/p/Co8sugoDoV0/' },
    { src: '/assets/pricing/wedding-party-fun-arkansas-phaminh.png', link: 'https://www.instagram.com/p/CxN_Jr0A9zC/' },
  ];
  const playButton = '/assets//pricing/phaminh-arkansas-wedding-rings-closeup.png';

  return (
    <div className="instagram-feed">
      {thumbnails.map((thumb, index) => (
        <a key={index} href={thumb.link} className="instagram-thumbnail" target="_blank" rel="noopener noreferrer">
          <div className="thumbnail-image" style={{ backgroundImage: `url(${process.env.PUBLIC_URL + thumb.src})` }}>
            <div className="hover-overlay">
              <img src={process.env.PUBLIC_URL + playButton} alt="Play Video" className="play-button" />
            </div>
          </div>
        </a>
      ))}
    </div>
  );
};

export default InstagramFeed;
