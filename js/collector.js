// this file powers the data collector for demographics, and send the data to the database


// store pd status
let pd_status = "";
// assign the user an id based on timestamp
let theid = 0;
const firebaseConfig = {
  apiKey: "AIzaSyAnlwmmb-Wc_xDpW1Vli0cEMm7hbPk_tR8",
  authDomain: "pd-website-test.firebaseapp.com",
  projectId: "pd-website-test",
  storageBucket: "pd-website-test.appspot.com",
  messagingSenderId: "497582545475",
  appId: "1:497582545475:web:aaf3986c35bf5ba414d2f6"
};

firebase.initializeApp(firebaseConfig);
var db = firebase.firestore();

// Detects the device type
function detectDeviceType() {
  var userAgent = navigator.userAgent || navigator.vendor || window.opera;

  if (/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream) {
      return 'iOS Device';
  }
  if (/android/i.test(userAgent)) {
      return 'Android Device';
  }
  if (/windows phone/i.test(userAgent)) {
      return 'Windows Phone';
  }
  if (/Macintosh|MacIntel|MacPPC|Mac68K/.test(userAgent)) {
      return 'Mac Desktop';
  }
  if (/Win32|Win64|Windows|WinCE/.test(userAgent)) {
      return 'Windows Desktop';
  }
  if (/Linux/.test(userAgent)) {
      return 'Linux Desktop';
  }
  return 'Desktop'; // Default to desktop if no match
}

// if the user has already taken test, redirect to landing page
if (localStorage.getItem('pdcompleted') == 'true'){
  window.location.href = '../src/done.html';
}

// do the interactivity for the pd status selector
function storestatus(status) {
  let yesButton = document.getElementById('yesButton');
  let noButton = document.getElementById('noButton');
  let suspectedButton = document.getElementById('suspectedpd');

  // Remove the btn-success class from all buttons
  yesButton.classList.remove('btn-success');
  noButton.classList.remove('btn-success');
  suspectedButton.classList.remove('btn-success');

  // Add the btn-success class to the clicked button and update pd_status
  if (status === 'pd') {
    yesButton.classList.add('btn-success');
    pd_status = 'pd';
  } else if (status === 'suspectedpd') {
    suspectedButton.classList.add('btn-success');
    pd_status = 'suspectedpd';
  } else {
    noButton.classList.add('btn-success');
    pd_status = 'nonpd';
  }
}



// Global variable to store the dominant hand
let dominantHand = "Right";

// Function to store the dominant hand selection
function storeHand(hand) {
  dominantHand = hand;
  let leftHandButton = document.getElementById('leftHandButton');
  let rightHandButton = document.getElementById('rightHandButton');

  // Remove the btn-success class from both buttons
  leftHandButton.classList.remove('btn-success');
  rightHandButton.classList.remove('btn-success');

  // Add the btn-success class to the selected button
  if (hand === 'Left') {
    leftHandButton.classList.add('btn-success');
  } else {
    rightHandButton.classList.add('btn-success');
  }
}


// when the user clicks start open verification window and save status
function startverify(){

  // send the data to the database
  senddata();

  // make the background blocker and verification dialogue visible
  let blocker = document.getElementById('blocker');
  let verify = document.getElementById('verify');
  blocker.style.display = 'block';
  blocker.style.opacity = 1;
  verify.style.display = 'block';

  // display demographics on the verification dialogue
  document.getElementById('aged').textContent = "Age: "+document.getElementById('age').value+" years old";
  document.getElementById('heightd').textContent = "Height: " + document.getElementById('height').value + " cm";
  document.getElementById('gend').textContent = "Gender: "+document.getElementById('gender').value;
  document.getElementById('raced').textContent = "Race: "+document.getElementById('race').value;

  // display pd status on the dialogue
  if (pd_status === 'pd') {
    document.getElementById('pdd').textContent = "PD Status: Has PD";
  } else if (pd_status === 'suspectedpd') {
    document.getElementById('pdd').textContent = "PD Status: Suspected but not Diagnosed";
  } else {
    document.getElementById('pdd').textContent = "PD Status: Does not have PD";
  }
  document.getElementById('dominantHandDisplay').textContent = "Dominant Hand: " + dominantHand;
}

// close the verification dialogue if user wants to change anything
function closeverify(){
  let blocker = document.getElementById('blocker');
  let verify = document.getElementById('verify');
  blocker.style.display = 'none';
  blocker.style.opacity = 0;
  verify.style.display = 'none';
}


//senddata function to include the dominant hand
async function senddata() {
  let userid = new Date().getTime().toString();
  sessionStorage.setItem('userid', userid);
  theid = userid;
  let deviceType = detectDeviceType(); 

  let data = {
    user: userid,
    age: document.getElementById('age').value,
    Participant_height: document.getElementById('height').value,
    gender: document.getElementById('gender').value,
    race: document.getElementById('race').value,
    status: pd_status,
    deviceType: deviceType,
    dominantHand: dominantHand
  };

  // Use the user ID as the document ID
  db.collection("testData").doc(userid).set(data, { merge: true })
  .then(() => {
      console.log("Document updated for User ID: ", userid);
    })
    .catch((error) => {
      console.error("Error writing document: ", error);
    });
}


// redirect user to the mouse test after they verify data
function commencetests(){
  // nah just send it directly
  //http://localhost:3000/?PDINFO&user=person4&age=65&gender=male&race=asian&status=nonpd
  console.log("commencetests function called");
  
  document.getElementById('ttrs').textContent = "Launching...";
  
  window.open('../src/mouse.html?'+theid,'_self');

}