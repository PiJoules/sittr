var md = new MobileDetect(window.navigator.userAgent);

// Static values
var Sittr_DROP_ACCEL_THRESHOLD = 0.09;
var Sittr_MINIMUM_DROP_TIME = 0.1;
var Sittr_STILLNESS_THRESHOLD = 0.020;
var Sittr_BUMP_THRESHOLD = 0.1;

// Holding states
SittrPhoneState_t = {
	SittrPhoneState_NotHolding: 0,
	SittrPhoneState_Holding: 1,
	SittrPhoneState_Unknown: 2,
	SittrPhoneState_Dropping: 3
};
var phoneState = SittrPhoneState_t.SittrPhoneState_Unknown;

var aX = null;
var aY = null;
var aZ = null;
var alpha = 0.5;

$.get("/rand", function(response){
	$("body").css("background-image", "url(" + response + ")");
});


var buffer = 500;
var justStarted, justStopped = false;


if (!window.DeviceMotionEvent) {
	$(".message").html("DeviceMotionEvent is not supported, but since you're here, why not view the <a href='https://github.com/PiJoules/sittr'>source code</a>.");
}
else if ( (md.os() || "").toLowerCase().indexOf("windows") > -1 ){
	$(".message").html("You are using a Windows phone. I am sorry.");
}
else if (!md.phone()){
	$(".message").html("This device is not a phone, but since you're here, why not view the <a href='https://github.com/PiJoules/sittr'>source code</a>.");
}
else {
	// Listen for the event and handle DeviceOrientationEvent object
  	window.addEventListener('devicemotion',function(eventData) {
		// Grab the acceleration from the results and apply and alpha filter
		var acceleration = eventData.acceleration;
		aX = alpha*acceleration.x + (1-alpha)*aX;
		aY = alpha*acceleration.y + (1-alpha)*aY;
		aZ = alpha*acceleration.z + (1-alpha)*aZ;

		var totalMotion = Math.abs(aX) + Math.abs(aY) + Math.abs(aZ);

		// If you're about to enter the not holding state, but there's some motion, then nevermind
		if (totalMotion > Sittr_STILLNESS_THRESHOLD){
			console.log("It looked like the phone was still, but then it got a jostle. Invalidating Not Hold timer");
		}

		// If the phone's not getting any user acceleration, then maybe it's not being held?
		if (phoneState !== SittrPhoneState_t.SittrPhoneState_NotHolding){
			if (totalMotion <= Sittr_STILLNESS_THRESHOLD){
				console.log("Phone is very still. Probably it's not being held. Starting Not Hold timer");
				stopHolding();
			}
		}

		// If the phone has a very small user acceleration, then you're almost definitely not holding it
		if (totalMotion <= Sittr_STILLNESS_THRESHOLD){
			console.log("Had a bump but then went still. Invalidating Hold");
		}

		// If the phone is not being held and it gets a bump, then maybe you're holding it now
		if (phoneState === SittrPhoneState_t.SittrPhoneState_NotHolding){
			if (totalMotion > 0.1){
				console.log("Phone got a bump. Maybe it's being held now? Starting Hold timer");
				startHolding();
			}
		}

		// If the phone is in an unknown state, then simply some motion is enough to suggest that we're being held
		if (phoneState === SittrPhoneState_t.SittrPhoneState_Unknown){
			if (totalMotion > Sittr_STILLNESS_THRESHOLD){
				console.log("Phone seems to be moving a bit. Starting Hold timer");
				startHolding();
			}
		}  
	}, false);
}

function startDropping(){
	if (phoneState !== SittrPhoneState_t.SittrPhoneState_Dropping){
		phoneState = SittrPhoneState_t.SittrPhoneState_Dropping;
		$(".message").html("Dropping");
	}
}

function startHolding(){
	if (!justStarted){
		if (phoneState === SittrPhoneState_t.SittrPhoneState_Dropping)
			return;
		if (phoneState !== SittrPhoneState_t.SittrPhoneState_Holding){
			phoneState = SittrPhoneState_t.SittrPhoneState_Holding;
			$(".message").html("");
			$("body").css("background-size", "cover");
			justStarted = true;
			setTimeout(function(){
				justStarted = false;
			}, buffer);
		}
	}
}

function stopHolding(){
	if (!justStopped){
		if (phoneState === SittrPhoneState_t.SittrPhoneState_Dropping)
			return;
		if (phoneState !== SittrPhoneState_t.SittrPhoneState_NotHolding){
			phoneState = SittrPhoneState_t.SittrPhoneState_NotHolding;
			$(".message").html("The phone is sitting.");
			$("body").css("background-size", "0");
			$.get("/rand", function(response){
				$("body").css("background-image", "url(" + response + ")");
			});
			justStopped = true;
			setTimeout(function(){
				justStopped = false;
			}, buffer);
		}
	}
}