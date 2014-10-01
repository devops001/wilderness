
var tileSize    = 64;
var viewSize    = {"width":800, "height":600};
var tilesInView = {"x":Math.floor(viewSize.width/tileSize), "y":Math.floor(viewSize.height/tileSize)};
var mapSize     = {"width":tilesInView.x,"height":tilesInView.y};
var tileNames   = ["grass", "rock", "tree", "wall", "player", "rat", "skull"];
var tileValues  = [];   //<- 0, 1, 2, etc...
var tileSprites = [];
var takeTurn    = false;
var resources   = [];
var mobs        = [];
var player, ui;

var margin = {
  "x": (viewSize.width  - tilesInView.x*tileSize)/2,
  "y": (viewSize.height - tilesInView.y*tileSize)/2
};

for (var y=0; y<mapSize.height; y++) {
  for (var x=0; x<mapSize.width; x++) {
    var tile = 0;
    if (x==0 || x==mapSize.width-1 || y==0 || y==mapSize.height-1) {
      tile = 3;
    }
    tileValues[x+y*mapSize.width] = tile;
  }
}

var loader = new PIXI.AssetLoader(["tiles.json"]);
loader.onComplete = function() {
  initMap();
  initPlayer();
  addResource("tree", 3);
  addResource("rock", 3);
  addResource("skull", 1);
  addUI();
};

loader.load();
var stage    = new PIXI.Stage(0x778899);
var renderer = PIXI.autoDetectRenderer(viewSize.width,viewSize.height);
document.body.appendChild(renderer.view);
requestAnimFrame(animate);

function addUI() {
  ui = {};
  ui.height = 50;
  ui.width  = 80;
  ui.log    = new PIXI.Text("log msg", {"font":"bold 18px Monospace", "fill":"#ff5566", "align":"left"});
  ui.log.position.x = margin.x;
  ui.log.position.y = viewSize.height - margin.y - ui.height;
  stage.addChild(ui.log);
}

function addResource(name, amount) {
  while (amount>0) {
    var x = Math.floor(Math.random() * mapSize.width-2) + 1;
    var y = Math.floor(Math.random() * mapSize.height-2) + 1;
    if (x>0 && x<mapSize.width && y>0 && y<mapSize.height && !isBlocked(x,y)) {
      amount--;
      var pos = getCenteredTilePos(x,y);
      var res = PIXI.Sprite.fromFrame(name);
      res.anchor.x   = 0.5;
      res.anchor.y   = 0.5;
      res.position.x = pos.x;
      res.position.y = pos.y;
      stage.addChild(res);
      resources.push(res);
      // attach some user data to the sprite:
      res.data           = {};
      res.data.hitPoints = Math.floor(Math.random()*6)+1;
      res.data.name      = name;      
      if (name == "tree") {
        res.data.lootName = "wood";
      } else if (name == "rock") {
        res.data.lootName = "stone";
      } else if (name == "skull") {
        res.data.lootName = "bone";
      } else {
        res.Data.lootName = "junk"; 
      }
    }
  }
}

function initMap() {
  var wallValue = tileNames.indexOf("wall");
  for (var y=0; y<mapSize.height; y++) {
    for (var x=0; x<mapSize.width; x++) {
      var value       = tileValues[x+y*mapSize.width];
      var name        = tileNames[value];
      var tile        = PIXI.Sprite.fromFrame(name);
      tile.anchor.x   = 0;
      tile.anchor.y   = 0;
      tile.position.x = margin.x + x*tileSize;
      tile.position.y = margin.y + y*tileSize;
      tileSprites.push(tile);
      stage.addChild(tile); 
      if (value == wallValue) {
        tile.tint = Math.random() * 0xFFFFFF;
      }
    }
  }
}

function initPlayer() {
  var pos = getCenteredTilePos(5,5);
  player  = PIXI.Sprite.fromFrame("player");
  player.anchor.x   = 0.5;
  player.anchor.y   = 0.5;
  player.position.x = pos.x;
  player.position.y = pos.y;
  stage.addChild(player);
  // attach some user data to the sprite:
  player.data = {};
  player.data.isPlayer  = true;
  player.data.inventory = {};
}

function animate() {
  requestAnimFrame(animate);
  if (player) player.rotation += 0.1;
  if (takeTurn) {
    console.log("taking a turn...");
    takeTurn = false;
  }
  renderer.render(stage);
}

function getCenteredTilePos(tileX, tileY) {
  var half = tileSize/2;
  var x    = margin.x + half + tileX*tileSize;
  var y    = margin.y + half + tileY*tileSize;
  return {"x":x, "y":y};
}

function getTilePos(sprite) {
  var half = tileSize/2;
  var x    = ((sprite.position.x - margin.x - half) / tileSize);
  var y    = ((sprite.position.y - margin.y - half) / tileSize);
  return {"x":x, "y":y};
}

function move(sprite, dx, dy) {
  var tilePos = getTilePos(sprite);
  var x = tilePos.x + dx;
  var y = tilePos.y + dy;
  if (x<0 || x>mapSize.width-1 || y<0 || y>mapSize.height-1 || isBlocked(x,y)) {
    if (sprite.data.isPlayer) {
      var res = getResource(x, y);
      if (res) {
        if (hitResource(res)) {
          lootResource(sprite, res);
        }
      } else {
        console.log("can't move there.");
      }
    }
  } else {
    var centered = getCenteredTilePos(x, y);  
    sprite.position.x = centered.x;
    sprite.position.y = centered.y;
    takeTurn = true;
  }
}

function hitResource(res) {
  res.data.hitPoints--;
  res.tint = Math.random() * 0xFFFFFF;
  if (res.data.hitPoints<1) {
    stage.removeChild(res);
    resources.splice(resources.indexOf(res),1);
  }
  return true;
}

function lootResource(sprite, res) {
  var drops = Math.floor(Math.random()*3)+1;
  var total = sprite.data.inventory[res.data.lootName];
  if (total) {
    total += drops;
  } else {
    total = drops;
  }
  sprite.data.inventory[res.data.lootName] = total;
  ui.log.setText("you gather "+ drops +" x "+ res.data.lootName +"\n(total: "+ total +")");
}

function isBlocked(tileX, tileY) {
  var value = tileValues[tileX+tileY*mapSize.width];
  if (value != 0) return true;

  var blocked = resources.concat(player);
  for (var i=0; i<blocked.length; i++) {
    var pos = getTilePos(blocked[i]);
    if (tileX==pos.x && tileY==pos.y) {
      return true;
    }
  }
  return false;
}

function getResource(tileX, tileY) {
  for (var i=0; i<resources.length; i++) {
    var pos = getTilePos(resources[i]);
    if (tileX==pos.x && tileY==pos.y) {
      return resources[i];
    }
  }
  return null;
}


document.addEventListener('keydown', function(event) {
  takeTurn = false;
  if (event.keyCode==37||event.keyCode==65||event.keyCode==100) {
    move(player, -1, 0);
  } else if (event.keyCode==38||event.keyCode==87||event.keyCode==104) {
    move(player, 0, -1);
  } else if (event.keyCode==39||event.keyCode==68||event.keyCode==102) {
    move(player, 1, 0);
  } else if (event.keyCode==40||event.keyCode==83||event.keyCode==98) {
    move(player, 0, 1);
  } else if (event.keyCode==105) {
    move(player, 1, -1);
  } else if (event.keyCode==99) {
    move(player, 1, 1);
  } else if (event.keyCode==103) {
    move(player, -1, -1);
  } else if (event.keyCode==97) {
    move(player, -1, 1);
  } else if (event.keyCode==101) {
    takeTurn = true;
  } else {
    console.log("pressed: ", event.keyCode);
  }
});

