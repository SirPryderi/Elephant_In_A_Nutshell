var context;

var masterVolume = 0.08;

window.addEventListener('load', init, false);

function init() {
    try {
        // Fix up for prefixing
        window.AudioContext = window.AudioContext || window.webkitAudioContext;
        context = new AudioContext();
        bufferLoader = new BufferLoader(
            context, [
                'sounds/nut.wav',
                'sounds/Explosion7.wav',
                'sounds/startup.wav'
            ],
            finishedLoading
        );


        bufferLoader.load();


        // Create a gain node.

    } catch (e) {
        alert('Web Audio API is not supported in this browser');
    }
}

var sound_nut, sound_explosion, sound_start;

function finishedLoading(bufferList) {

    // Create two sources and play them both together.
    sound_nut = context.createBufferSource();
    sound_explosion = context.createBufferSource();
    sound_start = context.createBufferSource();

    sound_nut.buffer = bufferList[0];
    sound_explosion.buffer = bufferList[1];
    sound_start.buffer = bufferList[2];

    sound_start.connect(context.destination);

    load_menu();

    /*
    sound_nut.connect(context.destination);
    sound_explosion.connect(context.destination);
    
    sound_nut.start(0);
    sound_explosion.start(0);
    */
}


function BufferLoader(context, urlList, callback) {
    this.context = context;
    this.urlList = urlList;
    this.onload = callback;
    this.bufferList = new Array();
    this.loadCount = 0;
}

BufferLoader.prototype.loadBuffer = function(url, index) {
    // Load buffer asynchronously
    var request = new XMLHttpRequest();
    request.open("GET", url, true);
    request.responseType = "arraybuffer";

    var loader = this;

    request.onload = function() {
        // Asynchronously decode the audio file data in request.response
        loader.context.decodeAudioData(
            request.response,
            function(buffer) {
                if (!buffer) {
                    alert('error decoding file data: ' + url);
                    return;
                }
                loader.bufferList[index] = buffer;
                if (++loader.loadCount == loader.urlList.length)
                    loader.onload(loader.bufferList);
            },
            function(error) {
                console.error('decodeAudioData error', error);
            }
        );
    }

    request.onerror = function() {
        alert('BufferLoader: XHR error');
    }

    request.send();
}

BufferLoader.prototype.load = function() {
    for (var i = 0; i < this.urlList.length; ++i)
        this.loadBuffer(this.urlList[i], i);
}


function playSound(buffer) {
    var source = context.createBufferSource(); // creates a sound source
    var gainNode = context.createGain();
    source.buffer = buffer; // tell the source which sound to play
    source.connect(gainNode); // connect the source to the context's gain node
    gainNode.connect(context.destination); // connect the gain node the context's destination (speakers)
    
    source.start(0); // play the source now
    
    gainNode.gain.value = masterVolume;
    // note: on older systems, may have to use deprecated noteOn(time);
}