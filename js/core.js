// GLOBAL VARS //

// So powa! Lower = quicker.
var clockSpeed = 0;
//Spawn Nuts per second (nps)
var nutsPerSecond = 1;

var max_speed = 0.40;
var min_speed = 0.35;

var score = 0;

// Elements
var playbox = $("#playbox");

// EVENTS //

function bindEvents() { //These will be bound once the game has started.
    playbox.mousemove(function(e) {
        var width = playbox.innerWidth();
        var offset = playbox.offset().left;
        var borderWidth = parseInt(playbox.css("border-top-width"));
        var mouseX = e.pageX - offset - borderWidth;
        var mouseXP = mouseX * 100 / width;
        $('#bar').setPPosition(mouseXP - 10, 97);

    }); //.mouseover(); // call the handler immediately


    playbox.bind('touchmove touchstart', function(e) {
        var width = playbox.innerWidth();
        var offset = playbox.offset().left;
        var borderWidth = parseInt(playbox.css("border-top-width"));
        var mouseX = e.originalEvent.touches[0].pageX - offset - borderWidth;
        var mouseXP = mouseX * 100 / width;
        $('#bar').setPPosition(mouseXP - 10, 97);
        e.preventDefault();
    });
}

//Nutpositioner JUST FOR DEVELOPING PURPOSE
playbox.find('.nut').each(function() {
    //var pos = $.parseJSON($(this).attr('data-pos'));
    var pos = $(this).attr('data-pos');
    pos = $.parseJSON(pos);
    $(this).setPPosition(pos.x, pos.y);
    $(this).fallDown();
});

// JQUERY PLUGINS //


$.fn.setPPosition = function(x, y) {
    var playbox = $("#playbox");

    $(this).css({
        left: x + "%",
        top: y + "%"
    });

    return this;
};

$.fn.StartCollisionChecker = function() {
    var myself = $(this);

    var collisionIntervalHandler = setInterval(function() {
        myself.collisionChecker()
    }, clockSpeed);

    $(this).attr('colHandler', collisionIntervalHandler);

    return this;
};

$.fn.StopCollisionChecker = function() {
    var collisionIntervalHandler = $(this).attr('colHandler');

    clearInterval(collisionIntervalHandler);

    //console.log('Physical engine shut down for the current element. Goodbye.');
    return this;
};

$.fn.fallDown = function() {


    var speed = random(min_speed, max_speed);

    var playbox_height = $("#playbox").height();

    var time = playbox_height / speed;

    $(this).StartCollisionChecker().animate({
        top: "100%"
    }, time, "linear", function() {
        groundCollision()
    });

};

$.fn.collisionChecker = function() {
    var bar = $("#bar");

    var meself = $(this);

    var entity_width = meself.width();
    var entity_height = meself.height();

    var entity_x = meself.offset().left;
    var entity_y = meself.offset().top;


    var bar_width = bar.width();
    var bar_height = bar.height();

    var bar_x = bar.offset().left;
    var bar_y = bar.offset().top;

    // Some random geometry. I admit it, it was copy-pasted and refactored. Shuuush. <3
    var collision = entity_x < bar_x + bar_width &&
        entity_x + entity_width > bar_x &&
        entity_y < bar_y + bar_height &&
        entity_height + entity_y > bar_y;

    if (collision) { // A COLLISION WITH THE BAR JUST HAPPENED! YAY!
        $(this).stop();
        $(this).StopCollisionChecker();
        $(this).remove();
        score++;

        // PLAY HERE
        playSound(sound_nut.buffer);

        $('#score').text(score);
    }
};


// FUNCTIONS //
function groundCollision() {
    game_over();
}

function getBaseLog(x, y) {
    return Math.log(y) / Math.log(x);
}

function random(min, max) {
    return Math.random() * (max - min) + min;
}

function blinkEye1() {
    $('#eye').text('O');
    setTimeout(blinkEye2, 5000);
}

function blinkEye2() {
    $('#eye').text('0');
    setTimeout(blinkEye1, 500);
}

function loadMenuPage(page, callback) {
    $('#menu').load(page, callback);
}

function requestFullScreen() {
    var elem = document.body;
    if (elem.requestFullscreen) {
        elem.requestFullscreen();
    } else if (elem.msRequestFullscreen) {
        elem.msRequestFullscreen();
    } else if (elem.mozRequestFullScreen) {
        elem.mozRequestFullScreen();
    } else if (elem.webkitRequestFullscreen) {
        elem.webkitRequestFullscreen();
    }
}

function camminaEle() {
    $('#elephant').animate({
        right: -2000
    }, 20000, "linear");
}

function difficulty() {
    if (score) {
        return nutsPerSecond + getBaseLog(200, score);
    }
    return nutsPerSecond;
}

function game_over() {
    console.log('game over');

    //The nut hit the ground

    //#####################
    //## GAME OVER ########
    //#####################
    playSound(sound_explosion.buffer);

    $(this).StopCollisionChecker();

    var gameOverMsg = '<h2><span>GAME OVER</span>\
                        </h2><p>An error has occurred to your Elephant.</p>\
                        <p>Because of your unsuitability he could not eat a nut and this soon led him to commit suicide.</p>\
                        <p>Click or tap anywhere to attempt a new match. Press CTRL-R or F5 to restart your game. If you do this, you will lose more of your useless time.</p>\
                        <p>Highscore: ' + score + 'P : 0x' + score.toString(16) + ' : ' + difficulty() + 'nps </p>';

    $('#message').html(gameOverMsg);

    playbox.find('.nut').each(function() {
        $(this).stop();
        clearTimeout(spawnerHandle);
    });

    $("#playbox").unbind('mousemove touchmove touchstart').addClass('gameOver').removeClass('playing').click(function (){
        restart_game();
    });
}

function restart_game(){
    playbox.find(".nut").each(function() {
        $(this).remove();
    });
    
    score = 0;
    
    nutsPerSecond = 1;
    
    $("#playbox").removeClass('gameOver').unbind('click');
    
    $("#message").html('');
    
    $('#score').text(score);
    
    start_game();
}

var spawnerHandle;

function spawner() {
    $('<div/>', {
        class: 'nut'
    }).setPPosition(random(2, 98), -7).appendTo('#playbox').fallDown();

    var timeOutTime = 1 / difficulty() * 1000;

    spawnerHandle = setTimeout(spawner, timeOutTime);
}

function load_menu() {
    $('#menu').load('pages/menu.html', function() {
        playbox.removeClass('loading').addClass('menu');
    });

}

function start_game() {

    /* INITS */
    playbox.removeClass('menu').addClass('playing');

    bindEvents();
    
    playSound(sound_start.buffer);

    spawnerHandle = setTimeout(spawner, 1000);

    blinkEye1();
}