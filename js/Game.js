class Game {
  constructor() {
    this.resetTitle= createElement('h2');
    this.resetButton = createButton("")
    this.blast = false
    this.playerMoving = false
    this.leftKeyActive = false   
    this.leaderBoardTitle = createElement('h2') 
    this.leader1 = createElement('h2')  
    this.leader2 = createElement('h2')
  }

  getState() {
    var gameStateRef = database.ref("gameState");
    gameStateRef.on("value", function(data) {
      gameState = data.val();
      console.log(data.val())
    });
  }
  update(state) {
    database.ref("/").update({
      gameState: state
    });
  }

  start() {
    player = new Player();
    playerCount = player.getCount();

    form = new Form();
    form.display();

    car1 = createSprite(width / 2 - 50, height - 100);
    car1.addImage("car1", car1_img);
    car1.addImage('blast', blast_img)
    car1.scale = 0.07;

    car2 = createSprite(width / 2 + 100, height - 100);
    car2.addImage("car2", car2_img);
    car2.addImage('blast', blast_img)
    car2.scale = 0.07;

    cars = [car1, car2];
    fuels = new Group()
    coins = new Group()
    obstacles = new Group()

    var obstaclesPositions = [
      { x: width / 2 + 250, y: height - 800, image: obstacle2Image },
      { x: width / 2 - 150, y: height - 1300, image: obstacle1Image },
      { x: width / 2 + 250, y: height - 1800, image: obstacle1Image },
      { x: width / 2 - 180, y: height - 2300, image: obstacle2Image },
      { x: width / 2, y: height - 2800, image: obstacle2Image },
      { x: width / 2 - 180, y: height - 3300, image: obstacle1Image },
      { x: width / 2 + 180, y: height - 3300, image: obstacle2Image },
      { x: width / 2 + 250, y: height - 3800, image: obstacle2Image },
      { x: width / 2 - 150, y: height - 4300, image: obstacle1Image },
      { x: width / 2 + 250, y: height - 4800, image: obstacle2Image },
      { x: width / 2, y: height - 5300, image: obstacle1Image },
      { x: width / 2 - 180, y: height - 5500, image: obstacle2Image }
    ];

    this.addSprites(fuels, 4, fuel_img, 0.02)
    this.addSprites(coins, 18, coin_img, 0.09)
    this.addSprites(obstacles, obstaclesPositions.length, obstacle1Image, 0.03, obstaclesPositions)
    //this.addSprites(blast, ) 
  }

  addSprites (spriteGroup, numberofSprites, image, scale, positions = []) {
    for(var i = 0; i < numberofSprites; i++){
      var x, y
      if(positions.length > 0){
        x = positions[i].x
        y = positions[i].y
        image = positions[i].image
      }
      else{
        x = random(width/2 + 150, width/2 - 150 )
        y = random(-height * 4.5, height - 400)
      }
      var sprite = createSprite(x, y)
      sprite.addImage(image)
      sprite.scale = scale
      spriteGroup.add(sprite)
    }
  }

  handleElements() {
    form.hide();
    form.titleImg.position(40, 50);
    form.titleImg.class("gameTitleAfterEffect");

    this.resetTitle.html("Reset Game")
    this.resetTitle.class("resetText")
    this.resetTitle.position(width / 2 + 200, 40)

    this.resetButton.class("resetButton")
    this.resetButton.position(width / 2 + 200, 100)

    this.leaderBoardTitle.html("Leaderboard")
    this.leaderBoardTitle.class("resetText")
    this.leaderBoardTitle.position(width / 3, 40)

    this.leader1.class("leadersText")
    this.leader1.position(width / 3, 80)
    this.leader2.class("leadersText")
    this.leader2.position(width / 3 , 130)
    
  

  }

  play() {
    this.handleElements();
    this.handleResetButton()

    Player.getPlayersInfo();

    if (allPlayers !== undefined) {
      image(track, 0, -height * 5, width, height * 6);

      this.showLife()
      this.showFuelbar()
      this.showLeaderboard()

      //index of the array
      var index = 0;
      for (var plr in allPlayers) {
        //add 1 to the index for every loop
        index = index + 1;

        //use data form the database to display the cars in x and y direction
        var x = allPlayers[plr].positionX;
        var y = height - allPlayers[plr].positionY;

        // save the value of players life in a tempary varible
        var currentLife = allPlayers[plr].life
        if (currentLife <= 0) {
          cars[index - 1].changeImage('blast')
          cars[index - 1].scale = 0.3
        }

        cars[index - 1].position.x = x;
        cars[index - 1].position.y = y;

        if (index === player.index) {
          stroke(10);
          fill("red");
          ellipse(x, y, 60, 60);

          this.handleObstacleCollision(index)
          this.handleFuel(index)
          if(player.life <= 0) {
            this.playerMoving = false
            this.blast = true
          }

          // Changing camera position in y direction
          camera.position.x = cars[index - 1].position.x;
          camera.position.y = cars[index - 1].position.y;
        }
      }

      if (this.playerMoving){
        player.positionY += 5
        player.update()
      }

      this.handlePlayerControls();

      const finishLine = height * 6 - 100

      if(player.positionY > finishLine ) {
        gameState = 2
        player.rank += 1
        Player.updateCarsAtEnd(player.rank)
        player.update()
        this.showRank()
      }
      
      drawSprites();
    }
  }

  showRank(){
    swal({
      title: `Awesome!${"\n"}Rank${"\n"}${player.rank}`,
      text: "You reached the finish line successfully",
      imageUrl:
        "https://raw.githubusercontent.com/vishalgaddam873/p5-multiplayer-car-race-game/master/assets/cup.png",
      imageSize: "100x100",
      confirmButtonText: "Ok"
    })
  }

  showLife() {
    push()
    image(life_img, width/ 2 -120, height -350 - player.positionY, 20, 20)
    fill ("white")
    rect(width / 2 -100, height -350 -player.positionY, 185, 20)
    fill("red")
    rect(width / 2 -100, height -350 -player.positionY, player.life, 20)
    pop()
  }

  showFuelbar() {
    push()
    image(fuel_img, width/ 2 -120, height -300 - player.positionY, 20, 20)
    fill ("white")
    rect(width / 2 -100, height -300 -player.positionY, 185, 20)
    fill("orange")
    rect(width / 2 -100, height -300 -player.positionY, player.fuel, 20)
    pop()
  }

  showLeaderboard() {
    var leader1, leader2
      var players = Object.values(allPlayers)
      if ((players[0].rank == 0 && players[1].rank == 0 )||players[0].rank == 1) {
        leader1 = players[0].rank +'&emsp;' + players [0].name + '&emsp;' + players[0].score
        leader2 = players[1].rank +'&emsp;' + players [1].name + '&emsp;' + players[1].score
      }
      if (players[1].rank == 1) {
        leader2 = players[0].rank +'&emsp;' + players [0].name + '&emsp;' + players[0].score
        leader1 = players[1].rank +'&emsp;' + players [1].name + '&emsp;' + players[1].score
      }
      this.leader1.html(leader1)
      this.leader2.html(leader2)

  }
  

  handleObstacleCollision(index) {
    if (cars[index -1].collide(obstacles)) {
      if (this.leftKeyActive) {
        player.positionX += 100
      }
      else {
        player.positionX -= 100
      }
      if (player.life > 0) {
        player.life = player.life - 185 /4 
        console.log(player.life)
      }
      player.update()
    }
  }

  handleFuel(index){
    cars[index- 1].overlap(fuels, function(collector, collected){
      player.fuel = 185
      collected.remove()
      
    })

    //REDUCING PLAYER CAR FUEL 
    if (player.fuel > 0 && this.playerMoving){
      player.fuel -= 0.3    
      }

    if (player.fuel <= 0) {
      gameState  = 2
      this.gameOver()
    }
  }

  handleResetButton(){
    this.resetButton.mousePressed(() =>{
      database.ref('/').set({
        playerCount:0,
        gameState:0,
        players:{}
      })
      window.location.reload()
    })
  }

  handlePlayerControls() {
    // handling keyboard events
    if (keyIsDown(UP_ARROW)) {
      this.playerMoving = true
      player.positionY += 10;
      player.update();
    }
    if (keyIsDown(LEFT_ARROW)) {
      this.leftKeyActive = true
      player.positionX -= 5;
      player.update();
    }
    if (keyIsDown(RIGHT_ARROW)) {
      this.leftKeyActive = false
      player.positionX += 5;
      player.update();
    }
  }
}
