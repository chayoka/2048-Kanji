function HTMLActuator() {
  this.headerContainer    = document.querySelector(".header-container");
  this.tileContainer    = document.querySelector(".tile-container");
  this.scoreContainer   = document.querySelector(".score-container");
  this.bestContainer    = document.querySelector(".best-container");
  this.messageContainer = document.querySelector(".game-message");

  this.score = 0;
  
  this.numeralType = 1;
}

HTMLActuator.prototype.actuate = function (grid, metadata) {
  var self = this;

  window.requestAnimationFrame(function () {
    self.clearContainer(self.tileContainer);

    grid.cells.forEach(function (column) {
      column.forEach(function (cell) {
        if (cell) {
          self.addTile(cell);
        }
      });
    });

    self.updateScore(metadata.score);
    self.updateBestScore(metadata.bestScore);
    
    this.numeralType = metadata.numeralType;

    if (metadata.terminated) {
      if (metadata.over) {
        self.message(false); // You lose
      } else if (metadata.won) {
        self.message(true); // You win!
      }
    }

  });
};

// Continues the game (both restart and keep playing)
HTMLActuator.prototype.continueGame = function () {
  this.clearMessage();
};

HTMLActuator.prototype.clearContainer = function (container) {
  while (container.firstChild) {
    container.removeChild(container.firstChild);
  }
};

HTMLActuator.prototype.addTile = function (tile) {
  var self = this;

  var wrapper   = document.createElement("div");
  var inner     = document.createElement("div");
  var position  = tile.previousPosition || { x: tile.x, y: tile.y };
  var positionClass = this.positionClass(position);

  // We can't use classlist because it somehow glitches when replacing classes
  var classes = ["tile", "tile-" + tile.value, positionClass];

  if (tile.value > 2048) classes.push("tile-super");

  this.applyClasses(wrapper, classes);

  inner.classList.add("tile-inner");
  
  // Translate value to Kanji
  var valueKanji = this.translateKanji(tile.value);
  inner.textContent = valueKanji;

  if (tile.previousPosition) {
    // Make sure that the tile gets rendered in the previous position first
    window.requestAnimationFrame(function () {
      classes[2] = self.positionClass({ x: tile.x, y: tile.y });
      self.applyClasses(wrapper, classes); // Update the position
    });
  } else if (tile.mergedFrom) {
    classes.push("tile-merged");
    this.applyClasses(wrapper, classes);

    // Render the tiles that merged
    tile.mergedFrom.forEach(function (merged) {
      self.addTile(merged);
    });
  } else {
    classes.push("tile-new");
    this.applyClasses(wrapper, classes);
  }

  // Add the inner part of the tile to the wrapper
  wrapper.appendChild(inner);

  // Put the tile on the board
  this.tileContainer.appendChild(wrapper);
};

HTMLActuator.prototype.applyClasses = function (element, classes) {
  element.setAttribute("class", classes.join(" "));
};

HTMLActuator.prototype.normalizePosition = function (position) {
  return { x: position.x + 1, y: position.y + 1 };
};

HTMLActuator.prototype.positionClass = function (position) {
  position = this.normalizePosition(position);
  return "tile-position-" + position.x + "-" + position.y;
};

HTMLActuator.prototype.updateScore = function (score) {
  this.clearContainer(this.scoreContainer);

  var difference = score - this.score;
  this.score = score;

  // Translate score to Kanji
  var scoreKanji = this.translateKanji(score);
  var differenceKanji = this.translateKanji(difference);
  this.scoreContainer.textContent = scoreKanji;

  if (difference > 0) {
    var addition = document.createElement("div");
    addition.classList.add("score-addition");
    addition.textContent = "+" + differenceKanji;

    this.scoreContainer.appendChild(addition);
  }
};

HTMLActuator.prototype.updateBestScore = function (bestScore) {
  // Translate score to Kanji
  var bestScoreKanji = this.translateKanji(bestScore);
  this.bestContainer.textContent = bestScoreKanji;
};

HTMLActuator.prototype.message = function (won) {
  var type    = won ? "game-won" : "game-over";
  var message = won ? "勝利" : "失敗";

  this.messageContainer.classList.add(type);
  this.messageContainer.getElementsByTagName("p")[0].textContent = message;
};

HTMLActuator.prototype.clearMessage = function () {
  // IE only takes one value to remove at a time.
  this.messageContainer.classList.remove("game-won");
  this.messageContainer.classList.remove("game-over");
};

HTMLActuator.prototype.updateGrid = function (grid, metadata) {
  this.numeralType = metadata.numeralType;
  var tiles = document.querySelectorAll('.tile-inner');
  for(var i = 0; i < tiles.length; i++) {
    var allClasses = (tiles[i].parentNode.className).split(" ");
    var cl;
    for (cl in allClasses) {
      var clText = allClasses[cl];
      if(allClasses[cl].indexOf("tile-position-") === 0) {
        clText = clText.replace("tile-position-","");
        var pos = clText.split("-");
        tiles[i].textContent = this.translateKanji(grid.cells[(pos[0]-1)][(pos[1]-1)].value);
      }
    }
  }

  var scoreKanji = this.translateKanji(metadata.score);
  this.scoreContainer.textContent = scoreKanji;
  
  var bestScoreKanji = this.translateKanji(metadata.bestScore);
  this.bestContainer.textContent = bestScoreKanji;
};

HTMLActuator.prototype.translateKanji = function (score) {
  var bigNumerals = {
    0: '零',
    1: '壹',
    2: '貳',
    3: '參',
    4: '肆',
    5: '伍',
    6: '陸',
    7: '柒',
    8: '捌',
    9: '玖'
  };

  var smallNumerals = {
    0: '〇',
    1: '一',
    2: '二',
    3: '三',
    4: '四',
    5: '五',
    6: '六',
    7: '七',
    8: '八',
    9: '九'
  };
  
  var scoreKanji = score.toString();
  if(this.numeralType == 1){
    scoreKanji = scoreKanji.replace(/0|1|2|3|4|5|6|7|8|9/gi, function(matched){
      return bigNumerals[matched];
    });
  }else if(this.numeralType == 2){
    scoreKanji = scoreKanji.replace(/0|1|2|3|4|5|6|7|8|9/gi, function(matched){
      return smallNumerals[matched];
    });
  }else{
  
  }
  
  
  return scoreKanji;
};