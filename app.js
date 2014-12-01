var ircbot = require('irc-robot');
var say = require('say');

var username = 'PUT YOUR USERNAME HERE';
var password = 'PUT YOUR TOKEN HERE';

// saltybet is always up, so default to that
var channel = process.argv.length > 2
              ? process.argv[2]
              : 'saltybet';

// regex for ascii chars
var ascii = /^[ -~]+$/;

// voices that are understandable
var voices = [
  "Agnes",
  "Alex",
  "Bad News",
  "Bruce",
  "Cellos",
  "Fiona",
  "Fred",
  "Good News",
  "Junior",
  "Karen",
  "Kathy",
  "Pipe Organ",
  "Princess",
  "Ralph",
  "Samantha",
  "Trinoids",
  "Vicki",
  "Victoria",
  "Zarvox",
];

var bot = ircbot({
  name: username,
  pass: password,
  chan: '#' + channel,
  server: 'irc.twitch.tv'
});

var queue = [];
var speaking = false;

console.log('Connecting to #' + channel);

bot.on(/^.*$/, function (req, res) {
  if (!ascii.test(req.msg)) {
    return; // non-ascii chars
  }

  if (queue.length > 15) {
    queue = []; // we are too far behind
  }

  var index = Math.abs(req.from.hashCode()) % voices.length;
  var voice = voices[index];

  queue.push({
    voice: voice,
    txt: req.msg,
    usr: req.from
  });

  if (!speaking) {
    speaking = true;
    talk();
  }
});

bot.connect();

function talk() {
  if (queue.length === 0) {
    speaking = false;
    return;
  }
  var msg = queue.shift();
  console.log(msg.usr + '[' + msg.voice + ']: ' + msg.txt);
  say.speak(msg.voice, msg.txt, function () {
    talk();
  });
}

String.prototype.hashCode = function () {
  var hash = 0, i, chr, len;
  if (this.length == 0) return hash;
  for (i = 0, len = this.length; i < len; i++) {
    chr   = this.charCodeAt(i);
    hash  = ((hash << 5) - hash) + chr;
    hash |= 0; // Convert to 32bit integer
  }
  return hash;
};
