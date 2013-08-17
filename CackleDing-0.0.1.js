


// The "Use Now" functions
cack.ding = cack.ding || {};

  // "Ding!"
  cack.ding.one =  function(){
    cack.ding.n(1)
  }

  // "Ding! Ding!"
  cack.ding.two =  function(){
    cack.ding.n(2)
  }

  // "Ding! Ding! Ding!"
  cack.ding.three =  function(){
    cack.ding.n(3)
  }

  // "Ding! * n"
  cack.ding.n =  function(n){

  }




// **** TODO
// The class functions
cack.classy = cack.classy || {};









// The html functions
cack.tag = cack.tag || {};

  cack.tag.audio.base64 = function(data, autoplay){
    autoplay = autoplay || true
    var tag = "<audio autoplay='" + autoplay + "' id='ajm-hello-ajm'><source src='data:audio/wav;base64,%s'></source></audio>" % data
      '<img alt="sample" src="data:image/png;base64,' + data + '">'
    return tag
  }

// ***** TODO
  cack.tag.embed.base64 = function(data, autoplay){
    autoplay = autoplay || true
    tag = ""
    return tag
  }
      




// The file functions
cack.file = cack.file || {};

  cack.file.base64 = function(filename){
    if (window.Base64){
      autoplay = autoplay || true
      data = Base64.strict_encode64(File.open(filename).read)
      data = data.toString('base64')
      return data
    }
    else{
      cack.not_happy("Base64 not supported")
    }
  } 





// A collection of generators using cack
cack.gen = cack.gen || {};

  cack.gen.tone =  function(freq, seconds, fs, amplitude, options){
    storage = options["storage"] || "blob"
    var buffer = cack.make_tone(freq, seconds, fs, amplitude);
    buffer = cack.applyFades(buffer, 100);
    url = cack.gen.url(buffer, fs, storage)
    return url
  }

  cack.gen.slide = function(startFreq, endFreq, seconds, fs, amplitude){
    storage = options["storage"] || "blob"
    var buffer = cack.make_slide_tone(startFreq, endFreq, seconds, fs, amplitude);
    buffer = cack.applyFades(buffer, 100);
    url = cack.gen.url(buffer, fs, storage)
    return url
  }


  cack.gen.url = function(buffer, fs, storage){
    
    storage = storage || "blob"
    
    if (window.File && window.Blob && storage == "blob") {
      var url = cack.make_audio_blob(buffer, fs);
    }
    else if (window.Base64 && storage == "base64"){
      // Generate base64 url
    }
    else{
      cack.not_happy("Base64 not supported")
    }

    return url;
  }








// The CaclkeDing Engine and Helpers
var cack = cack || {}

  cack.TWO_PI = Math.PI * 2.0

  cack.range = function(start, count){
    var vector = [];
    for (var i = 0; i < count; i++) {
        vector.push(start + i);
    }
    return vector;
  }  

  cack.linspace = function(lowNum, highNum, numSamples){
    var aToB = cack.range(0, numSamples);
    var dif = highNum - lowNum;
    for (var i = 0; i < numSamples; i++) {
        aToB[i] = ((aToB[i]/(numSamples-1)) * dif) + lowNum;
    }
    return aToB;
  }

  cack.cumsum = function(vect){
    var cumSum = 0;
    var cumSumVect = new Array(vect.length);
    for (var i = 0; i < vect.length; i++) {
        cumSum += vect[i];
        cumSumVect[i] = cumSum;
    }
    return cumSumVect;
  }

  cack.normalize = function(array, newMax){
    newMax = newMax || 0.9999;
    var maxVal = 0.0;
    for (var i = 0; i < array.length; i++) {
      maxVal = Math.max(Math.abs(array[i]), maxVal);
    }
    for (i = 0; i < array.length; i++) {
      array[i] = newMax * (array[i] / maxVal);
    }
    return array;
  }

  cack.applyFadeIn = function(array, sampsIn){
    var ramp = cack.linspace(0.0, 1.0, sampsIn);
    for (i = 0; i < ramp.length; i++) {
      array[i] = (array[i] * ramp[i]);
    }
    return array;
  }

  cack.applyFadeOut = function(array, sampsIn){
    var ramp = cack.linspace(0.0, 1.0, sampsIn);
    var arrayLength = array.length;
    for (i = 0; i < ramp.length; i++) {
      array[arrayLength-i-1] = (array[arrayLength-i-1] * ramp[i]);
    }
    return array;
  }

  cack.applyFades = function(array, numSamples){
    array = cack.applyFadeIn(array, numSamples);
    array = cack.applyFadeOut(array, numSamples);
    return array;
  }

  cack.time_gen = function(seconds, fs){
    return cack.linspace(0, seconds-(1/fs), seconds*fs);
  }

  cack.make_tone = function(freq, seconds, fs, amplitude){
    var tone = cack.time_gen(seconds, fs);
    var phase_progress = cack.TWO_PI * freq;
    for (var i=0;  i<tone.length; i++){
      tone[i] = amplitude * Math.sin(tone[i] * phase_progress);
    }
    return tone;
  }

  cack.make_slide_tone = function(startFreq, endFreq, seconds, fs, amplitude){
    var tone = cack.linspace(startFreq, endFreq, (fs * seconds));
    var phase_progress = (1/fs) * cack.TWO_PI;
    var loc_cumsum = 0;
    for (var i=0;  i<tone.length; i++){
      loc_cumsum += tone[i] * phase_progress
      tone[i] =  amplitude * Math.sin(loc_cumsum)
    }
    return tone;
  }

  cack.s_to_h = function(str) {
    var out_hex = '';
    for(var i=0; i<str.length; i++) {
      out_hex += str.charCodeAt(i).toString(16) + '';
    }    
    return parseInt(out_hex, 16);
  }

  cack.make_audio_blob = function(buffer, fs, channels){
    var wav_buffer = cack.wave(buffer, fs, channels)
    var blob = new Blob(wav_buffer, {type:'audio/wav'});
    window.URL = window.URL || window.webkitURL;
    var url = window.URL.createObjectURL(blob);
    return url;
  }

  // Convert to 16-bit interger
  cack.to_16 = function(sample){
    if (sample >= 1) {
      return (1 << 15) - 1;
    }
    else if (sample <= -1) {
      return -(1 << 15);
    }
    else {  
      return Math.round(sample * (1 << 15));
    }
  }

  cack.wave = function(buffer, fs){
   
    var fs = fs || 44100;
    var channels = 1
    var buffer_position = 0;
    var wav_buffer = new Int16Array(buffer.length + 23);

    wav_buffer[0] = cack.s_to_h("IR")
    wav_buffer[1] = cack.s_to_h("FF")
    wav_buffer[2] = (2*buffer.length + 15) & 0x0000ffff; // RIFF size
    wav_buffer[3] = ((2*buffer.length + 15) & 0xffff0000) >> 16; // RIFF size
    wav_buffer[4] = cack.s_to_h("AW")
    wav_buffer[5] = cack.s_to_h("EV")
    wav_buffer[6] = cack.s_to_h("mf")
    wav_buffer[7] = cack.s_to_h(" t")
    wav_buffer[8] = 18; //chunksize
    wav_buffer[9] = 0;
    wav_buffer[10] = 1; // format
    wav_buffer[11] = 1; // channels
    wav_buffer[12] = fs & 0x0000ffff; // sample per sec
    wav_buffer[13] = (fs & 0xffff0000) >> 16; 
    wav_buffer[14] = (2*channels*fs) & 0x0000ffff; // byte per sec
    wav_buffer[15] = ((2*channels*fs) & 0xffff0000) >> 16; 
    wav_buffer[16] = 4; // block align
    wav_buffer[17] = 16; // bit per sample
    wav_buffer[18] = 0; // cb size
    wav_buffer[19] = cack.s_to_h("ad")
    wav_buffer[20] = cack.s_to_h("at")
    wav_buffer[21] = (2*buffer.length) & 0x0000ffff; // data size[byte]
    wav_buffer[22] = ((2*buffer.length) & 0xffff0000) >> 16;

    for (var i = 0; i < buffer.length; i++) {
      wav_buffer[i+23] = cack.to_16(buffer[i]);
    }

    var mini_buffer_len = 1024
    var buffer_progress = mini_buffer_len
    var mini_buffer = [];
    var wav_array = [];

    for (var i = 0; i < wav_buffer.length; i+=buffer_progress){

      if( i + mini_buffer_len >= wav_buffer.length ){
       mini_buffer_len = wav_buffer.length - i;
      }

      mini_buffer = new Int16Array(mini_buffer_len)
    
      for(var n=0; n<mini_buffer.length; n++){
        mini_buffer[n] = wav_buffer[i+n];
      }

      wav_array.push(mini_buffer.buffer)
    }
    return wav_array;
  };


  cack.not_happy = function(reason){
    console.log("CackleDing: " + reason)
  }

