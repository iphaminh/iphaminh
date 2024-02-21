import React from 'react';
import './AboutMe.css'; // This imports regular CSS file

const AboutMe = () => {
  return (
    <div className="aboutMeContainer">
      <div className="aboutMeContent">
        <h2>I'm MINH!</h2>
        <p>
          Passionate about capturing life's moments, I specialize in turning
          visions into cinematic stories. Away from the camera, I'm exploring
          nature or engaging with the latest tech. My goal: to uniquely narrate
          your love story through my lens.
        </p>
      </div>
      <div className="aboutMeImage">
        <img src="/assets/images/phaminh-cinematography.png" alt="Cinematographer MINH in natural setting" />
      </div>
    </div>
  );
};

export default AboutMe;
