//clock functions, used in drawing the halachic sun clock
const canvas = document.getElementById("canvas");

const logging = false;

if (screen.width < screen.height) { //vertical setup
  canvas.width = screen.width*(1.055);
  document.getElementById("controls").classList.add("vertical");
}
else {
  canvas.width = screen.height*(1.055);
}
canvas.height = canvas.width;
document.getElementById("canvasCell").style.width = Number(canvas.width) + "px";

const digOffset = Math.round(canvas.width/6.5);
const ctx = canvas.getContext("2d");
let radius = canvas.height / 2;
ctx.translate(radius, radius);
let chimeHours = true;
let shouldIchime = true;
let controlsSet = false;
let bayom = false;
 

const fontName = "StamAshkenazCLM";
const fontPath = "url(/fonts/StamAshkenazCLM.woff2)";

/*
const fontName = "ashurith";
const fontPath = "url(/fonts/ashurith.woff2)";
*/

let stamFont = new FontFace(fontName, fontPath);

stamFont.load().then(function(font){

  // with canvas, if this is ommited won't work
  document.fonts.add(font);

  console.log('Font loaded');
});

const milliSecPerDay = 86400000;
let hayom;
let etmol;
let maHar;

const makomMizbeah = {lat:31.7780451, long:35.2353955}; 

/* 

([IS_DAY]==1 ? ((([HOUR_0_23]*60+[MIN])-(488.0-4*(35.235-30)-(9.87*sin(2*(([DAY_IN_YEAR]-81)*0.0172))-7.53*cos(([DAY_IN_YEAR]-81)*0.0172))+92*sin(([DAY_IN_YEAR]-80)*0.0172)))/(((930.2-4*(35.235-30)+(9.87*sin(2*(([DAY_IN_YEAR]-81)*0.0172))-7.53*cos(([DAY_IN_YEAR]-81)*0.0172))-92*sin(([DAY_IN_YEAR]-80)*0.0172))-(488.0-4*(35.235-30)-(9.87*sin(2*(([DAY_IN_YEAR]-81)*0.0172))-7.53*cos(([DAY_IN_YEAR]-81)*0.0172))+92*sin(([DAY_IN_YEAR]-80)*0.0172)))/12)*30) : ([HOUR_0_23]*60+[MIN] >= (930.2-4*(35.235-30)+(9.87*sin(2*(([DAY_IN_YEAR]-81)*0.0172))-7.53*cos(([DAY_IN_YEAR]-81)*0.0172))-92*sin(([DAY_IN_YEAR]-80)*0.0172)) ? ((([HOUR_0_23]*60+[MIN])-(930.2-4*(35.235-30)+(9.87*sin(2*(([DAY_IN_YEAR]-81)*0.0172))-7.53*cos(([DAY_IN_YEAR]-81)*0.0172))-92*sin(([DAY_IN_YEAR]-80)*0.0172)))/((1440-(930.2-4*(35.235-30)+(9.87*sin(2*(([DAY_IN_YEAR]-81)*0.0172))-7.53*cos(([DAY_IN_YEAR]-81)*0.0172))-92*sin(([DAY_IN_YEAR]-80)*0.0172))+(488.0-4*(35.235-30)-(9.87*sin(2*(([DAY_IN_YEAR]-81+1)*0.0172))-7.53*cos(([DAY_IN_YEAR]-81+1)*0.0172))+92*sin(([DAY_IN_YEAR]-80+1)*0.0172)))/12)*30+180) : ((([HOUR_0_23]*60+[MIN])+1440-(930.2-4*(35.235-30)+(9.87*sin(2*(([DAY_IN_YEAR]-81-1)*0.0172))-7.53*cos(([DAY_IN_YEAR]-81-1)*0.0172))-92*sin(([DAY_IN_YEAR]-80-1)*0.0172)))/((1440-(930.2-4*(35.235-30)+(9.87*sin(2*(([DAY_IN_YEAR]-81-1)*0.0172))-7.53*cos(([DAY_IN_YEAR]-81-1)*0.0172))-92*sin(([DAY_IN_YEAR]-80-1)*0.0172))+(488.0-4*(35.235-30)-(9.87*sin(2*(([DAY_IN_YEAR]-81)*0.0172))-7.53*cos(([DAY_IN_YEAR]-81)*0.0172))+92*sin(([DAY_IN_YEAR]-80)*0.0172)))/12)*30+180)))

((([HOUR_0_23]*60+[MIN]+([HOUR_0_23]<12?1440:0))-(1011-93*sin((([DAY_IN_YEAR]-80)*0.9856)*0.01745)))/((1440-((1011-93*sin((([DAY_IN_YEAR]-80)*0.9856)*0.01745))-(398+93*sin((([DAY_IN_YEAR]-80)*0.9856)*0.01745))))/12))
*/
let realPosit = {};

let timeBorders;
let shaothZmaniyoth;

let needsRefresh = true;

const wakeUps = [];

function hideControls(toHidem) {
  document.getElementById("controls").hidden = toHidem;
  document.getElementById("vertControlsHome").hidden = toHidem;  
}

function getLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(success, error);
  } else { 
    error();
  }
}

//accepts parameter ready2Set, default is 0, meaning to just diplay the options to set an alarm
//if passed 1, show the button to set the alarm with the desired options
//if passed 2, that means the button was clicked on and we should actually set the alarm
function setAlarmClock(ready2Set = 0) {
  const alarmOps = document.getElementById("alarmOps");
  switch(ready2Set) {
  case 0: //first reset to defaults
    for (let i = 0; i < alarmOps.children.length; i++) {
      if (alarmOps.children[i].type == "radio") {
        alarmOps.children[i].checked = (alarmOps.children[i].value == "בלילה");
      }
      if (alarmOps.children[i].type == "number") {
        alarmOps.children[i].value = alarmOps.children[i].defaultValue;
      }
    }
    document.getElementById("alarmOptions").hidden = false;  
    document.getElementById("setAlarmNow").hidden = true;    
    setTimeout(function() {setAlarmClock(1)}, 1500); 
  break;
  case 1:
    document.getElementById("setAlarmNow").hidden = false;
    document.getElementById("setAlarmNow").innerHTML = "לכוון שעון מעורר לשעה ";
    document.getElementById("setAlarmNow").innerHTML += document.getElementById("alarmTime").value;
    for (let i = 0; i < alarmOps.children.length; i++) {
      if ((alarmOps.children[i].type == "radio") && (alarmOps.children[i].checked)) {
        document.getElementById("setAlarmNow").innerHTML += " " + alarmOps.children[i].value;      
      }
    }
  break;
  case 2:
    const alarm2add = {bayom:document.getElementById("alarmYom").checked, time:document.getElementById("alarmTime").value, sounded:false};
    //check if it already exists in the wakeUps queue before adding it, don't want duplicates
    let isNewAlarm = true; //innocent until proven guilty
    for (let i = 0; i < wakeUps.length; i++) {
      if ((wakeUps[i].bayom == alarm2add.bayom) && (wakeUps[i].time == alarm2add.time)) {
        isNewAlarm = false;
        break;
      }
    }
    if (isNewAlarm) {
      wakeUps.push(alarm2add);          
    }
    else {
      console.log("duplicate alarm attempt made");
    }
    console.log("Alarm Status: ");
    logArrayObjects(wakeUps);
    updateAlarmStatus();
  }
}

function updateAlarmStatus() {
  const divAlarmStatus = document.getElementById("alarmStatus");
  divAlarmStatus.hidden = false;
  divAlarmStatus.innerHTML = "שעון מעורר מכוון ל";
  divAlarmStatus.innerHTML += "...";  
  for (let i = 0; i < wakeUps.length; i++) {  
    divAlarmStatus.innerHTML += "<br>";
    divAlarmStatus.innerHTML += "שעה";
    divAlarmStatus.innerHTML += " " + wakeUps[i].time + " ";    
    if (wakeUps[i].bayom) {
      divAlarmStatus.innerHTML += "ביום";    
    }
    else {
      divAlarmStatus.innerHTML += "בלילה";        
    }
  }
}

function logArrayObjects(arr) {
  for (let i = 0; i < arr.length; i++) {
    logObjectContents(arr[i]);
  }
}

function logObjectContents(obj) {
  let text = "";
  for (let x in obj) {
    text += x + ":" + obj[x] + ", ";
  } 
  console.log(text);
}

function setHourlyChimes(chimeButton) {
  console.log("chime status " + shouldIchime);  
  shouldIchime = !shouldIchime;
  console.log("should I chime?" + shouldIchime);  
  if (shouldIchime) {
    chimeButton.innerHTML = "להשבית בפעמוני השעה";
  }
  else {
    chimeButton.innerHTML = "להשתמש בפעמוני השעה";  
  }
}

function millisecs2Halakim(ms) {
  return (ms*3)/10000;
}

function getTimeBorders(posit) {
  const solarEtmol = new SolarCalc(etmol,posit.lat,posit.long);
  const solarHayom = new SolarCalc(hayom,posit.lat,posit.long);
  const solarMaHar = new SolarCalc(maHar,posit.lat,posit.long);

  const tb = {};
  tb.sunsetEtmol = solarEtmol.sunset;
  tb.sunriseHayom = solarHayom.sunrise;
  tb.sunsetHayom = solarHayom.sunset;
  tb.sunriseMaHar = solarMaHar.sunrise;      
  console.log("sunset etmol was " + tb.sunsetEtmol);
  console.log("sunrise hayom is " + tb.sunriseHayom);
  console.log("sunset hayom is " + tb.sunsetHayom);
  console.log("sunrise maHar is " + tb.sunriseMaHar);
  console.log("LAN al pi lookup today is " + solarHayom.solarNoon);
  console.log("LAN al pi Heshbon today is " + new Date(Number(tb.sunriseHayom) + (tb.sunsetHayom - tb.sunriseHayom)/2));
  return tb;
}

function getShaothZmaniyoth(timeBorders) {
  const sz = {};
  sz.halaylaSheavar = (timeBorders.sunriseHayom - timeBorders.sunsetEtmol)/12; 
  sz.hayom = (timeBorders.sunsetHayom - timeBorders.sunriseHayom)/12;
  sz.halayla = (timeBorders.sunriseMaHar - timeBorders.sunsetHayom)/12;
  console.log("shaoth zmaniyoth Halayla Sheavar was " + millisecs2Halakim(sz.halaylaSheavar) + " Halakim");
  console.log("shaoth zmaniyoth Hayom is " + millisecs2Halakim(sz.hayom) + " Halakim");
  console.log("shaoth zmaniyoth Halayla is " + millisecs2Halakim(sz.halayla) + " Halakim");    
  return sz;
}

function setGlobalTimeVariables() {
  hayom = new Date();
  etmol = new Date(hayom - milliSecPerDay);
  maHar = new Date(Number(hayom) + milliSecPerDay);
  console.log("Hayom is " + hayom);
  console.log("maHar is " + maHar);
  console.log("etmol was " + etmol);

  timeBorders = getTimeBorders(realPosit);
  shaothZmaniyoth = getShaothZmaniyoth(timeBorders);
}

function showControls() {
  //determing if controls will be on the right or on the bottom
  if (!controlsSet) {
    document.getElementById("controlPanel").hidden = false;
    if (screen.width < screen.height) { //vertical setup
//    if (true) {
      document.getElementById("vertControlsHome").innerHTML = document.getElementById("controls").innerHTML;
      document.getElementById("controls").innerHTML = "";    
    }
  }
  controlsSet = true;
}

function startClock() {
  setInterval(drawClock, 100);
  showControls();
}

function success(position) {
  realPosit.lat = position.coords.latitude;
  realPosit.long = position.coords.longitude;  
  const str2Log = "Using real position Lat: " + realPosit.lat + " -- Long: " + realPosit.long;
  console.log(str2Log);
  alert("GPS position updated. " + str2Log);
  document.getElementById("eyzehZman").innerHTML = "שימוש בזמן מקומי";
  //set the globals
  setGlobalTimeVariables();
  startClock();
  document.getElementById("chooseLocalTime").hidden = true;
  document.getElementById("chooseMizbeahTime").hidden = false;    
}

function topOfTheHour(time) {
  if ((chimeHours) && (time - Math.floor(time) < 0.001)) {
    console.log("its top of the hour " + time + " - " + Math.floor(time) + " = " + (time - Math.floor(time)));
    chimeHours = false;
    return true;
  }
  if (time - Math.floor(time) > 0.1) chimeHours = true;
  return false;
}

//check if this time is an alarm time, and if so, return true
function wakeUpTime(time) {
  for (let i = 0; i < wakeUps.length; i++) {  
    if ((wakeUps[i].bayom == bayom) && (wakeUps[i].time - time < 0.001) && !(wakeUps[i].sounded)) {
      console.log("its time to wake up!");
      wakeUps[i].sounded = true;
      return true;
    }
    if ((wakeUps[i].bayom == bayom) && (wakeUps[i].time - time > 0.01) && (wakeUps[i].sounded)) {
      wakeUps[i].sounded = false; //resets alarm clock
    }
    return false;
  }
}

function hourlyChime() {
  document.getElementById("chime").play();
  console.log("ding");
}

/* actually 'sounds the alarm' so to speak
-- needs to be revised such that the user can select to either have a single chime (as it stands now),
   or a double or triple chime (currently commented out).  this should be a uniform option for all alarms that the user sets, default to triple chime
*/
function soundWakeUp() {
  hourlyChime();
  //setTimeout(hourlyChime, 10000);
  //setTimeout(hourlyChime, 20000);  
}

//give the 4 time borders and the 3 shaoth Zemaniyoth (globals), find the current apparent time
function shaaAchshav() {
  const achshavShelahem = new Date();
  if ((needsRefresh) && (achshavShelahem.getHours() == 2)) {
    needsRefresh = false;
    console.log("resetting time");
    setGlobalTimeVariables();
  }
  else if (achshavShelahem.getHours() == 3) {
    needsRefresh = true;  
  }
  let achshavShelanu;
  let string2Log = "It is ";
  bayom = false;
  if (achshavShelahem < timeBorders.sunriseHayom) {
    // last night
    string2Log += "Halayla Sheavar. ";
    achshavShelanu = (achshavShelahem - timeBorders.sunsetEtmol)/shaothZmaniyoth.halaylaSheavar;
    chimeHours = (achshavShelanu < 3.5);
    displayShaInfo("הלילה", shaothZmaniyoth.halaylaSheavar, Math.floor(achshavShelanu + 1) - achshavShelanu);
  }
  else if (achshavShelahem < timeBorders.sunsetHayom) {
    // today
    bayom = true;
    string2Log += "Hayom. ";
    achshavShelanu = (achshavShelahem - timeBorders.sunriseHayom)/shaothZmaniyoth.hayom;
    chimeHours = (achshavShelanu > 0.5);    
    displayShaInfo("היום", shaothZmaniyoth.hayom, Math.floor(achshavShelanu + 1) - achshavShelanu);    
  }
  else {
    // tonight
    string2Log += "Halayla. ";
    achshavShelanu = (achshavShelahem - timeBorders.sunsetHayom)/shaothZmaniyoth.halayla;
    chimeHours = (achshavShelanu < 3.5);
    displayShaInfo("הלילה", shaothZmaniyoth.halayla, Math.floor(achshavShelanu + 1) - achshavShelanu);    
  }
  string2Log += "The current time is " + achshavShelanu;
  if (logging) console.log(string2Log);
  if (wakeUpTime(achshavShelanu)) {
    soundWakeUp();
  }
  else if ((topOfTheHour(achshavShelanu)) && (shouldIchime)) hourlyChime();
  return achshavShelanu;
}

function displayShaInfo(zman, HalakimPerShaa, nisharim) {
  document.getElementById("shainfo").innerHTML = " שעה זמנית " + zman + ": " + millisecs2Halakim(HalakimPerShaa).toFixed(1) + " חלקים ";
  document.getElementById("shainfo").innerHTML += "<br>";
  document.getElementById("shainfo").innerHTML += millisecs2Halakim(nisharim*HalakimPerShaa).toFixed(1) + " חלקים נשארים בשעה הזאת ";  
  document.getElementById("shainfo").hidden = false;
}    

function error() {
  const str2Log = "using default position Lat: " + realPosit.lat + " -- Long: " + realPosit.long;
  console.log(str2Log);  
  alert("GPS not working right now, " + str2Log);

  //set the globals
  setGlobalTimeVariables();

  console.log("the time now is " + shaaAchshav());
  startClock();
}

function setMizbeah() {
  realPosit.lat = makomMizbeah.lat;
  realPosit.long = makomMizbeah.long;   
  setGlobalTimeVariables();
  startClock();
  document.getElementById("chooseLocalTime").hidden = false;
  document.getElementById("chooseMizbeahTime").hidden = true;
  document.getElementById("eyzehZman").innerHTML = "שימוש בזמן המזבח בירושלים";      
}

setMizbeah();

radius = radius * 0.90;

function drawClock() {
  drawFace(ctx, radius);
  drawNumbers(ctx, radius);
  drawTime(ctx, radius);
}

function drawFace(ctx, radius) {
  const grad = ctx.createRadialGradient(0,0,radius*0.95, 0,0,radius*1.05);
  grad.addColorStop(0, '#333');
  grad.addColorStop(0.5, 'white');
  grad.addColorStop(1, '#333');
  ctx.beginPath();
  ctx.arc(0, 0, radius, 0, 2*Math.PI);
  ctx.fillStyle = 'white';
  ctx.fill();
  ctx.strokeStyle = grad;
  ctx.lineWidth = radius*0.1;
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(0, 0, radius*0.1, 0, 2*Math.PI);
  ctx.fillStyle = '#333';
  ctx.fill();
}

function makeAlefBeth(gematria) {
  switch (gematria.toString()) {
    case "1": 
      return("א");
    break;
    case "2": 
      return("ב");
    break;
    case "3": 
      return("ג");
    break;
    case "4": 
      return("ד");
    break;
    case "5": 
      return("ה");
    break;
    case "6": 
      return("ו");
    break;
    case "7": 
      return("ז");
    break;
    case "8": 
      return("ח");
    break;
    case "9": 
      return("ט");
    break;
    case "10": 
      return("י");
    break;
    case "11": 
      return("יא");
    break;
    case "12": 
      return("٠");
    break;      
  }
}


function drawNumbers(ctx, radius) {
  ctx.font = radius*0.15 + "px " + fontName;
  ctx.textBaseline="middle";
  ctx.textAlign="center";
  for(let num = 1; num < 13; num++){
    let ang = (num + 6) * Math.PI / 6;
    ctx.rotate(ang);
    ctx.translate(0, -radius*0.85);
    ctx.rotate(-ang);
    ctx.fillText(makeAlefBeth(num), 0, 0);
    ctx.rotate(ang);
    ctx.translate(0, radius*0.85);
    ctx.rotate(-ang);
  }
}

function drawTime(ctx, radius){
    const shaaAchsavShelanu = shaaAchshav();    
    let minute = shaaAchsavShelanu - Math.floor(shaaAchsavShelanu);
    // draw hourhand
    drawHand(ctx, ((shaaAchsavShelanu+6)*Math.PI/6), radius*0.5, radius*0.07);
    //minute
    minute=(minute*Math.PI*2);
    drawHand(ctx, minute, radius*0.8, radius*0.07);
    ctx.translate(0,digOffset);
    ctx.fillStyle = "blue";
    ctx.fillText(shaaAchsavShelanu.toFixed(3), 0, 0);
    ctx.fillStyle = "black";    
    ctx.translate(0,-digOffset);
/*    // second
    second=(second*Math.PI/30);
    drawHand(ctx, second, radius*0.9, radius*0.02);
*/
}

function drawHand(ctx, pos, length, width) {
    ctx.beginPath();
    ctx.lineWidth = width;
    ctx.lineCap = "round";
    ctx.moveTo(0,0);
    ctx.rotate(pos);
    ctx.lineTo(0, -length);
    ctx.stroke();
    ctx.rotate(-pos);
}
