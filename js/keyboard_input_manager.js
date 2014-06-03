function KeyboardInputManager() {
  this.events = {};

  this.listen();
}

NodeList.prototype.forEach = HTMLCollection.prototype.forEach = Array.prototype.forEach;

KeyboardInputManager.prototype.on = function (event, callback) {
  if (!this.events[event]) {
    this.events[event] = [];
  }
  this.events[event].push(callback);
};

KeyboardInputManager.prototype.emit = function (event, data) {
  var callbacks = this.events[event];
  if (callbacks) {
    callbacks.forEach(function (callback) {
      callback(data);
    });
  }
};

KeyboardInputManager.prototype.listen = function () {
  var self = this;

  document.addEventListener("keydown", function (event) {
    var modifiers = event.altKey || event.ctrlKey || event.metaKey ||
                    event.shiftKey;
    if (!modifiers) {
      if (event.which === 32) self.restart.bind(self)(event);
    }
  });

  var cells = document.getElementsByClassName("grid-cell");
  cells.forEach(function(cell){
    var id = cell.id; // "grid-cell-x-y"
    var x = Number(id[10])-1;
    var y = Number(id[12])-1;

    cell.addEventListener("click", function(e) {
      e.preventDefault();
      self.emit('addTile', {x:x, y:y, value:2});
    })

    cell.addEventListener("contextmenu", function(e) {
      e.preventDefault();
      self.emit('addTile', {x:x, y:y, value:4});
    });

  });

  var retry = document.getElementsByClassName("retry-button")[0];
  retry.addEventListener("click", this.restart.bind(this));

  // Listen to swipe events
  var gestures = [Hammer.DIRECTION_UP, Hammer.DIRECTION_RIGHT,
                  Hammer.DIRECTION_DOWN, Hammer.DIRECTION_LEFT];

  var gameContainer = document.getElementsByClassName("game-container")[0];
  var handler       = Hammer(gameContainer, {
    drag_block_horizontal: true,
    drag_block_vertical: true
  });

  handler.on("swipe", function (event) {
    event.gesture.preventDefault();
    mapped = gestures.indexOf(event.gesture.direction);

    if (mapped !== -1) self.emit("move", mapped);
  });
};

KeyboardInputManager.prototype.restart = function (event) {
  event.preventDefault();
  this.emit("restart");
};
