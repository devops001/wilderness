
var sizes = {
  "screen" : {"x":window.innerWidth, "y":window.innerHeight},
  "map"    : {"x":64, "y":64},
  "tile"   : {"x":64, "y":64},
  "view"   : {"x":0,  "y":0},
  "margin" : {"x":10, "y":10},
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
tiles.names  = ["grass", "rock", "tree", "wall", "player", "rat", "skull"];
tiles.rooms  = [];
tiles.sprite = new PIXI.Sprite(new PIXI.RenderTexture(sizes.screen.x, sizes.screen.y));

var ui = {};

function createUI() {
  ui.height  = 50;
  ui.width   = 80;
  ui.console = new PIXI.Text("hello", {"font":"bold 18px Monospace", "fill":"#ffffff", "align":"left"});
  ui.console.position.x = sizes.margin.x;
  ui.console.position.y = sizes.view.y*sizes.tile.y - sizes.margin.y - ui.height;
  stage.addChild(ui.console);
}

function showMessage(msg) {
  ui.console.setText(msg);
}





function createRoom() {
  var room     = {};
  room.values  = [];
  room.texture = new PIXI.RenderTexture(sizes.map.x*sizes.tile.x, sizes.map.y*sizes.tile.y);
  // set tile values:
  for (var y=0; y<sizes.map.y; y++) {
    for (var x=0; x<sizes.map.x; x++) {
      if (Math.random() > 0.9) {
        value = tiles.names.indexOf("wall");
      } else {
        value = tiles.names.indexOf("grass");
      }
      room.values[x+y*sizes.map.x] = value;
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

  var blocked = true;
  var x       = Math.floor(sizes.view.x/2);
  var y       = Math.floor(sizes.view.y/2);
  if (isBlocked(x, y)) {
    unblock(x, y);
  }
  tiles.player.tilePos    = {"x":x, "y":y};
  var screenPos           = getCenteredTilePos(x, y);
  tiles.player.position.x = screenPos.x;
  tiles.player.position.y = screenPos.y;
}

function isBlocked(tileX, tileY) {
  if (tileX<0 || tileY<0 || tileX>sizes.map.x-1 || tileY>sizes.map.y-1) {
    return true;
  }
  var value = tiles.currentRoom.values[tileX+tileY*sizes.map.x];
  return value != tiles.names.indexOf("grass");
}

function unblock(tileX, tileY) {
  tiles.currentRoom.values[tileX+tileY*sizes.map.x] = tiles.names.indexOf("grass");
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
  var tilePos = {"x":tiles.player.tilePos.x+dx, "y":tiles.player.tilePos.y+dy};
  if (!isBlocked(tilePos.x, tilePos.y)) {
    tiles.player.tilePos = tilePos;
    tiles.sprite.position.x -= dx * sizes.tile.x;
    tiles.sprite.position.y -= dy * sizes.tile.y;
  }
}



document.addEventListener('keydown', function(event) {
  var player = tiles.player;
  if (event.keyCode==37||event.keyCode==65||event.keyCode==100) {
    moveWorld(-1, 0);
  } else if (event.keyCode==38||event.keyCode==87||event.keyCode==104) {
    moveWorld(0, -1);
  } else if (event.keyCode==39||event.keyCode==68||event.keyCode==102) {
    moveWorld(1, 0);
  } else if (event.keyCode==40||event.keyCode==83||event.keyCode==98) {
    moveWorld(0, 1);
  } else if (event.keyCode==105) {
    moveWorld(1, -1);
  } else if (event.keyCode==99) {
    moveWorld(1, 1);
  } else if (event.keyCode==103) {
    moveWorld(-1, -1);
  } else if (event.keyCode==97) {
    moveWorld(-1, 1);
  } else if (event.keyCode==101) {
    // rest
  } else {
    console.log("pressed: ", event.keyCode);
  }
});

function animate() {
  requestAnimationFrame(animate);
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


