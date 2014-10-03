
var sizes = {
  "screen" : {"x":window.innerWidth, "y":window.innerHeight},
  "map"    : {"x":64,  "y":64},
  "tile"   : {"x":64,  "y":64},
  "view"   : {"x":0,   "y":0},
  "margin" : {"x":10,  "y":10},
  "console": {"x":50,  "y":80},
  "bar"    : {"x":200, "y":10},
};

sizes.view.x = Math.floor(sizes.screen.x/sizes.tile.x); 
sizes.view.y = Math.floor(sizes.screen.y/sizes.tile.y); 

var stage    = new PIXI.Stage(0x556677);
var renderer = new PIXI.autoDetectRenderer(sizes.screen.x, sizes.screen.y);
renderer.view.style.width   = sizes.screen.x +"px";
renderer.view.style.height  = sizes.screen.y +"px";
renderer.view.style.display = "block";
document.body.appendChild(renderer.view);

var tiles    = {};
tiles.names  = ["grass", "water", "tree", "crate", "player", "rat", "skull", "cheetah", "tree1", "tree2", "slot"];
tiles.sprite = new PIXI.Sprite(new PIXI.RenderTexture(sizes.screen.x, sizes.screen.y));
tiles.rooms  = [];

var ui = {};

function createUI() {
  ui.height    = 50;
  ui.width     = 80;
  ui.container = new PIXI.DisplayObjectContainer();
  stage.addChild(ui.container);

  ui.console = new PIXI.Text("hello", {"font":"bold 18px Monospace", "fill":"#ffffff", "align":"left"});
  ui.console.position.x = sizes.margin.x;
  ui.console.position.y = sizes.view.y*sizes.tile.y - sizes.margin.y - ui.height;
  ui.container.addChild(ui.console);

  ui.playerStats            = new PIXI.DisplayObjectContainer();
  ui.playerStats.position.x = 0;
  ui.playerStats.position.y = 0;
  ui.container.addChild(ui.playerStats);

  ui.playerPic            = PIXI.Sprite.fromFrame("cheetah");
  ui.playerPic.position.x = 0;
  ui.playerPic.position.y = 0;
  ui.playerStats.addChild(ui.playerPic);

  var barMargin = 5;

  ui.healthBar = new PIXI.Graphics();
  ui.healthBar.beginFill(0xff0000);
  ui.healthBar.lineStyle(2, 0x000000);
  ui.healthBar.drawRect(0,0, sizes.bar.x, sizes.bar.y);
  ui.healthBar.position.x = barMargin + sizes.tile.x;
  ui.healthBar.position.y = barMargin*2;
  ui.playerStats.addChild(ui.healthBar);

  ui.hungerBar = new PIXI.Graphics();
  ui.hungerBar.beginFill(0x00ff00);
  ui.hungerBar.lineStyle(2, 0x000000);
  ui.hungerBar.drawRect(0,0, sizes.bar.x, sizes.bar.y);
  ui.hungerBar.position.x = barMargin   + sizes.tile.x;
  ui.hungerBar.position.y = barMargin*3 + sizes.bar.y;
  ui.playerStats.addChild(ui.hungerBar);

  ui.thirstBar = new PIXI.Graphics();
  ui.thirstBar.beginFill(0x0000ff);
  ui.thirstBar.lineStyle(2, 0x000000);
  ui.thirstBar.drawRect(0,0, sizes.bar.x, sizes.bar.y);
  ui.thirstBar.position.x = barMargin   + sizes.tile.x;
  ui.thirstBar.position.y = barMargin*4 + sizes.bar.y*2;
  ui.playerStats.addChild(ui.thirstBar);

  ui.actionBar = new PIXI.DisplayObjectContainer();
  ui.actionBar.position.x = sizes.console.x + sizes.margin.x*2;
  ui.actionBar.position.y = sizes.screen.y  - sizes.margin.y - sizes.tile.y;
  ui.container.addChild(ui.actionBar);
  ui.actionBar.buttons = [];
 
  for (var x=0; x<4; x++) {
    var button = PIXI.Sprite.fromFrame("slot"); 
    button.anchor.x   = 0;
    button.anchor.y   = 0;
    button.position.x = 300 + (5 + sizes.tile.x) * x;
    button.position.y = 0;
    ui.actionBar.buttons.push(button);
    ui.actionBar.addChild(button);
  }
  
}

function updatePlayerBars() {
  var ps     = tiles.player.state;
  var health = ps.health * (sizes.bar.x/ps.healthMax);
  var hunger = ps.hunger * (sizes.bar.x/ps.hungerMax);
  var thirst = ps.thirst * (sizes.bar.x/ps.thirstMax);

  ui.healthBar.beginFill(0xffffff);
  ui.healthBar.drawRect(0,0, sizes.bar.x, sizes.bar.y);
  ui.healthBar.beginFill(0xff0000);
  ui.healthBar.drawRect(0,0, health, sizes.bar.y);

  ui.hungerBar.beginFill(0xffffff);
  ui.hungerBar.drawRect(0, 0, sizes.bar.x, sizes.bar.y);
  ui.hungerBar.beginFill(0x00ff00);
  ui.hungerBar.drawRect(0,0, hunger, sizes.bar.y);
  
  ui.thirstBar.beginFill(0xffffff);
  ui.thirstBar.drawRect(0, 0, sizes.bar.x, sizes.bar.y);
  ui.thirstBar.beginFill(0x0000ff);
  ui.thirstBar.drawRect(0,0, thirst, sizes.bar.y);
}

function showMessage(msg) {
  ui.console.setText(msg);
}

function createRoom() {
  var room     = {};
  room.values  = [];
  room.texture = new PIXI.RenderTexture(sizes.map.x*sizes.tile.x, sizes.map.y*sizes.tile.y);
  // set tile values:
  var maxWater = 2;
  var grass    = tiles.names.indexOf("grass");
  var water    = tiles.names.indexOf("water");
  for (var y=0; y<sizes.map.y; y++) {
    for (var x=0; x<sizes.map.x; x++) {
      var index = x+y*sizes.map.x;
      if (maxWater>0 && y>3 && Math.random()>0.99) {
        maxWater--;
        room.values[index] = water;
      } else {
        room.values[index] = grass;
      }
    }
  }
  // create sprites:
  var container = new PIXI.DisplayObjectContainer();
  for (var y=0; y<sizes.map.y; y++) {
    for (var x=0; x<sizes.map.x; x++) {
      var value       = room.values[x+y*sizes.map.x];
      var name        = tiles.names[value];
      var tile        = PIXI.Sprite.fromFrame(name);
      tile.anchor.x   = 0;
      tile.anchor.y   = 0;
      tile.position.x = x*sizes.tile.x;
      tile.position.y = y*sizes.tile.y;
      container.addChild(tile);
    }
  }
  // create texture:
  room.texture.render(container, new PIXI.Point(0, 0), true);
  tiles.rooms.push(room);
}

function createRooms() {
  createRoom();
  tiles.currentRoom = tiles.rooms[0];
  tiles.sprite.setTexture(tiles.currentRoom.texture);
  tiles.sprite.position.x = 0;
  tiles.sprite.position.y = 0;
  stage.addChild(tiles.sprite);
}

function createPlayer() {
  tiles.player          = PIXI.Sprite.fromFrame("player");
  tiles.player.anchor.x = 0.5;
  tiles.player.anchor.y = 0.5;
  stage.addChild(tiles.player);
  var x = Math.floor(sizes.view.x/2);
  var y = Math.floor(sizes.view.y/2);
  tiles.player.tilePos    = {"x":x, "y":y};
  var screenPos           = getCenteredTilePos(x, y);
  tiles.player.position.x = screenPos.x;
  tiles.player.position.y = screenPos.y;

  tiles.player.state = {
    "isAlive" : true,
    "tookTurn": false,
    "healthMax" : 100,
    "hungerMax" : 100,
    "thirstMax" : 100,
    "health": 100,
    "hunger": 100,
    "thirst": 100,
    "turnsUntilHungryMax" : 10,
    "turnsUntilThirstyMax":  5,
    "turnsUntilHungry" : 10,
    "turnsUntilThirsty":  5,
  };
}

function isBlocked(tileX, tileY) {
  if (tileX<0 || tileY<0 || tileX>sizes.map.x-1 || tileY>sizes.map.y-1) {
    return true;
  }
  var value = tiles.currentRoom.values[tileX+tileY*sizes.map.x];
  return value != tiles.names.indexOf("grass");
}

function isTileType(tileName, tileX, tileY) {
  return tiles.currentRoom.values[tileX+tileY*sizes.map.x] == tiles.names.indexOf(tileName);
}

function getCenteredTilePos(tileX, tileY) {
  var x = sizes.tile.x/2 + tileX*sizes.tile.x;
  var y = sizes.tile.y/2 + tileY*sizes.tile.y;
  return {"x":x, "y":y};
}

function getTilePos(screenX, screenY) {
  var x = ((screenX - sizes.tile.x/2) / sizes.tile.x);
  var y = ((screenY - sizes.tile.y/2) / sizes.tile.y);
  return {"x":x, "y":y};
}

function getCenteredMapStartPosition() {
  var posX = sizes.map.x /2;
  var posY = sizes.map.y /2;
  return {"x":posX, "y":posY};
}

function move(sprite, dx, dy) {
  var tilePos = getTilePos(sprite.position.x, sprite.position.y);
  var x       = tilePos.x + dx; 
  var y       = tilePos.y + dy; 
  if (! (x<0 || y<0 || x>sizes.map.x-1 || y>sizes.map.y-1 || isBlocked(x,y))) {
    var centered      = getCenteredTilePos(x, y);
    sprite.position.x = centered.x;
    sprite.position.y = centered.y;
  }
}

function moveWorld(dx, dy) {
  var ps = tiles.player.state;
  if (!ps.isAlive) return;
  var tilePos = {"x":tiles.player.tilePos.x+dx, "y":tiles.player.tilePos.y+dy};
  if (isBlocked(tilePos.x, tilePos.y)) {
    if (isTileType("water", tilePos.x, tilePos.y)) {
      showMessage("you drink some water");
      ps.thirst = ps.thirstMax;
      updatePlayerBars();
    }
  } else {
    tiles.player.tilePos = tilePos;
    tiles.sprite.position.x -= dx * sizes.tile.x;
    tiles.sprite.position.y -= dy * sizes.tile.y;
    return true;
  }
  return false;
}

document.addEventListener('keydown', function(event) {
  var player = tiles.player;
  if (event.keyCode==37||event.keyCode==65||event.keyCode==100) {
    player.state.tookTurn = moveWorld(-1, 0);
  } else if (event.keyCode==38||event.keyCode==87||event.keyCode==104) {
    player.state.tookTurn = moveWorld(0, -1);
  } else if (event.keyCode==39||event.keyCode==68||event.keyCode==102) {
    player.state.tookTurn = moveWorld(1, 0);
  } else if (event.keyCode==40||event.keyCode==83||event.keyCode==98) {
    player.state.tookTurn = moveWorld(0, 1);
  } else if (event.keyCode==105) {
    player.state.tookTurn = moveWorld(1, -1);
  } else if (event.keyCode==99) {
    player.state.tookTurn = moveWorld(1, 1);
  } else if (event.keyCode==103) {
    player.state.tookTurn = moveWorld(-1, -1);
  } else if (event.keyCode==97) {
    player.state.tookTurn = moveWorld(-1, 1);
  } else if (event.keyCode==101) {
    player.state.tookTurn = true;  
  } else {
    console.log("pressed: ", event.keyCode);
  }
});

function takeTurn() {
  tiles.player.state.tookTurn = false;
  var ps = tiles.player.state;
  if (!ps.isAlive) return;

  ps.turnsUntilHungry  -= 1;
  ps.turnsUntilThirsty -= 1;

  var changeBars = false;

  if (ps.turnsUntilHungry < 1) {
    ps.turnsUntilHungry  = ps.turnsUntilHungryMax;
    changeBars           = true;
    if (ps.hunger > 0) {
      ps.hunger -= 1;
    } else {
      ps.health -= 1;
      if (ps.health < 1) {
        showMessage("you died of hunger :(");
        ps.isAlive = false;
      } 
    }
  }

  if (ps.turnsUntilThirsty < 1) {
    ps.turnsUntilThirsty = ps.turnsUntilThirstyMax;
    changeBars           = true;
    if (ps.thirst > 0) {
      ps.thirst -= 1;
    } else {
      ps.health -= 1;
      if (ps.health < 1) {
        showMessage("you died of thirst :(");
        ps.isAlive = false;
      } 
    }
  }

  if (changeBars) {
    updatePlayerBars();
  }
}


function animate() {
  requestAnimationFrame(animate);
  if (tiles.player.state.tookTurn) {
    takeTurn();
  }
  renderer.render(stage);
}

var loader = new PIXI.AssetLoader(["tiles.json"]);
loader.onComplete = function() {
  createRooms();
  createPlayer();
  createUI();
  animate();
};
loader.load();


