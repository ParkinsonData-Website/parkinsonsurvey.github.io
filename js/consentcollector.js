// Initialize Firebase
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

// Event listener for DOM content loaded
document.addEventListener('DOMContentLoaded', function() {
    // Set Today's Date as default for the consentDate field
    var today = new Date();
    var dd = String(today.getDate()).padStart(2, '0');
    var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
    var yyyy = today.getFullYear();
    today = yyyy + '-' + mm + '-' + dd;
    document.getElementById('consentDate').value = today;

    // Event listener for form submission
    document.getElementById('consentForm').addEventListener('submit', function(event) {
        event.preventDefault(); // Prevent default form submission

        // Clear previous error messages
        clearErrors();

        // Form validation
        var isValid = true;
        var participantName = document.getElementById('participantName').value.trim();
        var participantSignature = document.getElementById('participantSignature').value.trim();
        var consentDate = document.getElementById('consentDate').value;
        var consentCheck = document.getElementById('consentCheck').checked;
        var participantEmail = document.getElementById('participantEmail').value.trim(); 
        var participantMobile = document.getElementById('participantMobile').value.trim();
        var extendedInterviewConsent = document.getElementById('extendedInterviewConsent').checked; // New checkbox field

        // Validation checks
        if (!participantName) {
            document.getElementById('nameError').textContent = 'This field is required';
            isValid = false;
        }
        if (!participantSignature) {
            document.getElementById('signatureError').textContent = 'This field is required';
            isValid = false;
        }
        if (!consentDate) {
            document.getElementById('dateError').textContent = 'This field is required';
            isValid = false;
        }
        if (!consentCheck) {
            document.getElementById('consentCheckError').textContent = 'You must agree before submitting';
            isValid = false;
        }
        if (participantEmail &&!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(participantEmail)) {
            document.getElementById('emailError').textContent = 'Please enter a valid email address';
            isValid = false;
        }
        if (participantMobile && !/^\d{10,15}$/.test(participantMobile)) {
            document.getElementById('mobileError').textContent = 'Please enter a valid mobile number';
            isValid = false;
        }
        if (!isValid) {
            return; // Stop the form submission if validation fails
        }

        // Proceed with storing consent information in Firebase if validation passes
        storeConsent(participantName, participantSignature, consentDate, consentCheck, participantEmail, extendedInterviewConsent, participantMobile);
    });

    // Function to clear error messages
    function clearErrors() {
        document.getElementById('nameError').textContent = '';
        document.getElementById('signatureError').textContent = '';
        document.getElementById('dateError').textContent = '';
        document.getElementById('consentCheckError').textContent = '';
        document.getElementById('emailError').textContent = '';
        document.getElementById('mobileError').textContent = '';
        // No need to clear extendedInterviewConsentError as it's not a required field
    }

    // Function to store consent in Firebase
    function storeConsent(name, signature, date, consentGiven, email, interviewConsent, mobile) { // Add mobile parameter here
        let userid = sessionStorage.getItem('userid');
        if (!userid) {
            userid = Date.now().toString(); // Use current timestamp as unique ID
            sessionStorage.setItem('userid', userid);
        }
        db.collection("consents").add({
            userid: userid,
            name: name,
            signature: signature,
            date: date,
            consentGiven: consentGiven,
            email: email, // Email is now optional
            extendedInterviewConsent: interviewConsent,
            mobile: mobile // Make sure mobile is included here
        })
        .then(() => {
            console.log("Document successfully updated");
            window.location.href = `../src/collectinfo.html?userid=${userid}`;
        })
        .catch((error) => {
            console.error("Error updating document:", error);
        });
    }
    
});
