# Lower arm movement data collection website for Parkinson's Disease. 
### Website Available [Here](https://parkisonsurvey.github.io)

# Overview
- Website collects demographic data of the patient
- Website conducts computer mouse movement and keyboard tapping tests to measure arm movement
- When tests have finished, website sends data to a database

# Code setup
- Uses HTML, CSS and Bootstrap for UI
- Uses JS for data collection
- Uses HTML Canvas to draw tracing lines and keypress cues

# File setup
  - index.html: redirects to /src/index.html
  - /src: contains all the html files
    - about.html: gives information about website and study
    - collectinfo.html: html form to collect information and send to database
    - complete.html: informs user that they are done with the test and can retake the survey
    - done.html: informs user that they have already completed the test if they have already done so
    - index.html: homepage/intro page
    - keyboard.html: page for keyboard tapping test
    - mouse.html: page for mouse movement test
  /src_practice: contains all the html files for Practice Tests
    - about.html: gives information about website and study
    - collectinfo.html: html form to collect information and send to database
    - complete.html: informs user that they are done with the practice test
    - index.html: homepage/intro page
    - keyboard.html: page for keyboard tapping test
    - mouse.html: page for mouse movement test
  - /css: contains all css files
    - styles.css: main css file
    - utility.css: secondary css file
  - /js: contains all js files
    - collector.js: manages html for data collection for collectinfo.html, manages sending data to database
    - keyboard.js: runs keyboard tapping test for keyboard.html
    - mouse.js: runs mouse movement test for mouse.html
  - /js_practice: contains all js files for Practice Tests
    - collector.js: manages html for data collection for collectinfo.html, manages sending data to database
    - keyboard.js: runs keyboard tapping test for keyboard.html
    - mouse.js: runs mouse movement test for mouse.html
  - /assets: contains all assets
    - logo.png: UH Manoa letterhead for homepage
   
# Website Hosting
  - This website is hosted using Github pages at [https://parkisonsurvey.github.io](https://parkisonsurvey.github.io)

# Data storage
  - Data is transmitted and Stored at Firebase

# Current Data
  - Data Collected from the first run of this study is available at [https://github.com/skparab2/Parkinsons_movement_tests_dataset](https://github.com/skparab2/Parkinsons_movement_tests_dataset)
