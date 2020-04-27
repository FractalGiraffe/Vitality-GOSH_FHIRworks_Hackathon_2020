/*Attatch event handler to back button*/
(function() {
    window.addEventListener('tizenhwkey', function(ev) {
        if (ev.keyName === 'back') {
        	 window.history.back();
        }
    });
}());


function upload_BPM(bpm) {
	const CLIENT_ID = "";
	const CLIENT_SECRET = "";
	const SCOPE = "";
	const payload = "";
	const url = "";
	
	$.ajax({    
		type: "POST",
	    url: url,
	    data: payload,
	    contentType: "application/x-www-form-urlencoded",
	    success: function (data) {
	    	post_to_fhir_server(data.access_token, bpm);
	    }
	});
}

function post_to_fhir_server(access_token, bpm) {
	jsonObj = {
	    "resourceType": "Observation",
	    "status": "final",
	    "code": {
	        "text": "heartrate",
	        "coding": [
	            {
	                "code": "8867-4",
	                "system": "http://loinc.org",
	                "display": "Heart rate"
	            }
	        ]
	    },
	    "subject": {
	        "reference": "Patient/8f789d0b-3145-4cf2-8504-13159edaa747"
	    },
	    "effectivePeriod": {
	        "start": "2020-02-02T21:40:50.460120Z",
	        "end": "2020-02-02T21:40:50.460120Z"
	    },
	    "component": [],
	    "valueQuantity": {
	        "value": bpm,
	        "unit": "BPM"
	    }
	};
	
	$.ajax({    
		type: "POST",
	    url: "https://gosh-fhir-synth.azurehealthcareapis.com/Observation",
	    data: JSON.stringify(jsonObj),
	    beforeSend: function (xhr) {
	        xhr.setRequestHeader('Authorization', 'Bearer ' + access_token);
	    },
	    dataType: "json",
	    contentType: "application/json",
	    success: function(data) {
	    	document.getElementById('heartrate').textContent = bpm;
	    },
	    error:	function (jqXHR, textStatus, errorThrown) {
	    	document.getElementById('heartrate').textContent = errorThrown;
	    }
	});
}

//Define success handler for health info permission request
function onSuccess() {
    var measure_click = document.getElementById('start');
    measure_click.addEventListener('click', function() {
        tizen.power.request("SCREEN", "SCREEN_NORMAL"); //Keep display on while measuring.
        document.getElementById('heartrate').textContent = "Measuring...";
        function onchangedCB(hrmInfo) {
            if (hrmInfo.heartRate <= 0){
            	onchangedCB();
            }     
            else {
            	document.getElementById('heartrate').textContent = "Uploading...";
            	upload_BPM(hrmInfo.heartRate);
                var date_key = new Date();
                localStorage.setItem(date_key, hrmInfo.heartRate);  //Store heart rate according to time stamp in local storage.
                tizen.humanactivitymonitor.stop('HRM'); //Stop sensor.
            }
        }
        tizen.humanactivitymonitor.start('HRM', onchangedCB); //Start Heart Rate Monitor
    });
}

//Define error handler for health info permission request
function onError(e) {
    console.log("error " + JSON.stringify(e));
}

tizen.ppm.requestPermission("http://tizen.org/privilege/healthinfo", onSuccess, onError); //Invoke pop up for user's permission.