import { group } from 'console'
import { Background } from '../object/BackGround'
import { SETTING } from '../../GameSetting/index'
import { Scene } from 'phaser'
// import { Dog } from '../object/dog'

let player: any
let platforms: any
let cursors: any
let stars: any
let skyTile: any
let target: any
let tori: any
let subchas: any
let vertical: any
let myCam: any
let groundDark: any // 수정 예정
let next: any
let boneLayer: any
let subSquiLayer: any
let subBirdLayer: any
let yellowBallLayer: any
let potionLayer: any
let mushLayer: any
let signLayer: any
let bundLayer: any
let map: any

export default class Stage1 extends Phaser.Scene {
    private scoreText!: Phaser.GameObjects.BitmapText
    private lifeText!: Phaser.GameObjects.BitmapText
    private worldTimer!: Phaser.Time.TimerEvent
    private isDoubleJump: boolean = false
    private stage1Bgm: any = this
    private button!: any
    private moveButton!: any
    private jumpButton!: any
    
    // private dog!: Dog 

    constructor() {
      super('Stage1')
    }

    public init(): void {
        this.registry.set('score', 0)
        this.registry.set('life', 80000)
        this.registry.set('stage', 1)
    }

    public preload(): void {
      
      
      this.button = this.add.graphics().setDepth(8).setScrollFactor(0)
      this.button.lineStyle(4, 0x2a275c)
      
      this.button.fillStyle(0xfd6a41, 0.5)
      this.button.strokeRect(630, 450, 140, 80)
      this.button.fillRect(630, 450, 140, 80)

      this.moveButton = this.add
      .text(700, 490, 'Jump', {
        color: '#2A275C',
        fontSize: '22px',
        fontStyle: 'bold',
      }).setDepth(8)
      .setOrigin(0.5).setScrollFactor(0).setScale(2)
      this.moveButton.setInteractive()
    
    }
  
    public create(): void {
      this.game.input.addPointer()

       this.stage1Bgm.sound.add('stage1_bgm').play({
            loop: true
        }) // 노래 재생하기
        this.stage1Bgm.sound.setVolume(0.1)
       
      
        this.physics.world.setBounds(0, 0, 30000, 600)

        this.lifeText = this.add // 라이프 텍스트 생성
        .bitmapText(30, 30, 'font', `LIFE ${this.registry.values.life}`)
        .setDepth(6)
        .setScrollFactor(0)
  
        this.scoreText = this.add // 점수 텍스트 생성
        .bitmapText(530, 30, 'font', `SCORE ${this.registry.values.score}`)
        .setDepth(6)
        .setScrollFactor(0)
        
        skyTile = this.add.tileSprite(0, 0, 30000, 600, 'skydark').setScrollFactor(0).setOrigin(0).setDepth(0)
        platforms = this.physics.add.staticGroup()
        target = this.physics.add.staticGroup()
        subchas = this.physics.add.staticGroup()
        next = this.physics.add.staticGroup()

       
        map = this.make.tilemap({ key: "map" });

        let boneTiles = map.addTilesetImage('bone')
        boneLayer = map.createLayer('boneLayer', boneTiles, 0, 0);
        boneLayer.setTileIndexCallback(3, this.collectBone, this).setDepth(1).setScale(1)
        
        let subSquiTiles =map.addTilesetImage('subSqui')
        subSquiLayer = map.createLayer('subSquiLayer', subSquiTiles, 0, 0)
        subSquiLayer.setTileIndexCallback(2, this.collectSubSqui, this).setDepth(1)
        
        let subBirdTiles = map.addTilesetImage('subBird');
        subBirdLayer = map.createLayer('subBirdLayer', subBirdTiles, 0, 0)
        subBirdLayer.setTileIndexCallback(1, this.collectSubBird, this).setDepth(1)
        
        let potionTiles = map.addTilesetImage('potion')
        potionLayer = map.createLayer('potionLayer', potionTiles, 0, 0)
        potionLayer.setTileIndexCallback(4, this.collectPotion, this).setDepth(1)
        
        let mushroomBallTiles = map.addTilesetImage('mushroom')
        mushLayer = map.createLayer('mushLayer', mushroomBallTiles, 0, 0)
        mushLayer.setTileIndexCallback(6, this.collectMush, this).setDepth(1)
        
        let signExitTiles = map.addTilesetImage('signExit')
        signLayer = map.createLayer('signLayer', signExitTiles, 0, 0)
        signLayer.setTileIndexCallback(7, this.collectSignExit, this).setDepth(1)
        
        let bundTiles = map.addTilesetImage('bund')
        bundLayer = map.createLayer('bundLayer', bundTiles, 0, 0)
        bundLayer.setCollisionByExclusion(-1, true)
      
        groundDark = this.add.tileSprite(0, 600, 30000, 100, 'way').setScrollFactor(0)
        
        platforms.add(groundDark)

        this.worldTimer = this.time.addEvent({ // 게임에서 시간 이벤트 등록, 1초당 콜백 호출 (콜백내용은 초당 체력 감소)
            delay: 1000,
            callback: this.worldTime,
            callbackScope: this,
            loop: true,
          })
        next.create(10000, 500, 'logo').setScale(2.2).refreshBody()

        player = this.physics.add.sprite(600, 400, 'dog').setScale(1.6).setDepth(3)  // 플레이어 생성
        
        myCam = this.cameras.main
        myCam.setBackgroundColor(0xbababa) // 게임 배경색
        myCam.setBounds(-200, 0, Infinity, 200, true)
        this.cameras.main.startFollow(player)
        
        player.setCollideWorldBounds(true)

        this.anims.create({ // 플레이어 기본 프레임 4번
            key: 'turn',
            frames: [ { key: 'dog', frame: 0 } ], 
            frameRate: 10
        })
    
        this.anims.create({ // 플레이어 오른쪽 동작시 5번 ~ 8번 프레임 8fps로 재생
            key: 'right',
            frames: this.anims.generateFrameNumbers('dog', { start: 1, end: 11 }),
            frameRate: 10,
            repeat: -1
        })
        
        cursors = this.input.keyboard.createCursorKeys()

        stars = this.physics.add.group({  // 별 20개 생성 (현재는 좌표설정이 없어서 제대로 동작하지않음)
            key: 'star',
            repeat: 20,
        })
    
        this.physics.add.collider(player, bundLayer) // 첫번째인자와 두번째 인자간의 충돌 관련
        this.physics.add.collider(stars, platforms)
        this.physics.add.collider(target, platforms)
    
        this.physics.add.overlap(player, stars, this.collectStar, undefined, this) 
        this.physics.add.collider(player, target, this.getSubcha, undefined, this) 
        this.physics.add.collider(player, next, this.nextStage, undefined, this) 
        
        this.physics.add.overlap(player, boneLayer, this.collectBone, undefined, this)
        this.physics.add.overlap(player, bundLayer, this.collectBund, undefined, this)
        this.physics.add.overlap(player, subSquiLayer, this.collectSubSqui, undefined, this)
        this.physics.add.overlap(player, subBirdLayer, this.collectSubBird, undefined, this)
        this.physics.add.overlap(player, potionLayer, this.collectPotion, undefined, this)
        this.physics.add.overlap(player, mushLayer, this.collectMush, undefined, this)
        this.physics.add.overlap(player, signLayer, this.collectSignExit, undefined, this)
        
    }
    
    public update(time: number, delta: number): void {  
      console.log(player.x)  
    var pointer = this.game.input.activePointer
    // if (pointer.isDown) {
    //   console.log(pointer)
    //   player.setVelocityX(550)
    //   skyTile.tilePositionX += 0.3
    //   player.anims.play('right', true)
    // }
    this.moveButton.on(
      'pointerdown',
      () => {
        if (player.body.onFloor()) {
          this.isDoubleJump = true;
          player.body.setVelocityY(-850);
        } else if (this.isDoubleJump) {
          this.isDoubleJump = false;
          player.body.setVelocityY(-850);
        }
      },
      this
    )    
        this.physics.world.wrap(player, 5000)
         // this.background.update()

        if (cursors.right.isDown || this.game.input.pointers[1].isDown) { 
            player.anims.play('right', true)// 키보드 방향키 오른쪽 입력시 플레이어 +12 오른쪽이동
            player.setVelocityX(550)
            skyTile.tilePositionX += 0.3
            
            subchas.children.iterate(function (child: any, idx: number) {  //서브캐릭들 붙이는 함수
                if(player.x - (50 + idx * 50) > child.x) {
                    child.x += 1
                }
                if(player.y > child.y) {
                    child.y += 1
                }
            })
        }
        else {
            player.setVelocityX(0)
            player.anims.play('turn')
        }
        
        const didJump = Phaser.Input.Keyboard.JustDown(cursors.space)
        
        // console.log("땅에 있음?", player.body.onFloor(), "canDoubleJump : ", this.canDoubleJump)
        if (didJump) {
          if (player.body.onFloor()) {
            this.isDoubleJump = true;
            player.body.setVelocityY(-850);
          } else if (this.isDoubleJump) {
            this.isDoubleJump = false;
            player.body.setVelocityY(-850);
          }
        }
        // if (cursors.space.isDown) { // 스페이스바 입력시 점프
        //     player.setVelocityY(-700)
        //     subchas.children.iterate(function (child: any, idx: number) {
        //         if(player.y > child.y) {
        //             child.y += 1
        //         }
        //     })
        // }
        if (this.registry.values.life < 0) { // 게임 오버
            console.log('die')
            this.scene.pause()
            this.scene.start('StageOver', { score: this.registry.values.score, life: this.registry.values.life, stage: 1  })
          }
    }
    private worldTime(): void {  // 1초당 실행되는 함수 this.worldTimer 참조
        this.registry.values.score += 10
        this.scoreText.setText(`SCORE ${this.registry.values.score}`)
        this.registry.values.life -= 100
        this.lifeText.setText(`LIFE ${this.registry.values.life}`)
    }

      collectStar (player: any, star: any):void { // 별 다모으면 다시 만드는 함수
        star.disableBody(true, true)
        if (stars.countActive(true) === 0) {
            stars.children.iterate(function (child: any) {
                child.enableBody(true, child.x, 700, true, true)
            })
        }
      }

      collectBone(player: any, tile: any):void {
        boneLayer.removeTileAt(tile.x, tile.y)
      }

      collectSubSqui(player: any, tile: any):void {
        subSquiLayer.removeTileAt(tile.x, tile.y)
      }

      collectSubBird(player: any, tile: any):void {
        subBirdLayer.removeTileAt(tile.x, tile.y)
      }

      collectyellowBall(player: any, tile: any):void {
        yellowBallLayer.removeTileAt(tile.x, tile.y)
      }

      collectPotion(player: any, tile: any):void {
        potionLayer.removeTileAt(tile.x, tile.y)
      }
      collectMush(player: any, tile: any):void {
        mushLayer.removeTileAt(tile.x, tile.y)
      }
      collectSignExit(player: any, tile: any):void {
        signLayer.removeTileAt(tile.x, tile.y)
      }
      collectBund(player: any, tile: any):void {
        bundLayer.removeTileAt(tile.x, tile.y)
      }

    
      nextStage () : void { // 다음 스테이지로 넘어가는 함수
        this.game.sound.stopAll()
        this.scene.start('Stage1Event', { score: this.registry.values.score + 10000, life: this.registry.values.life + 1000, stage: 2  }) // stage1Event로 scene 이동 (데이터 이전)
      }
      
      //this.physics.add.collider(player, target, this.getSubcha, undefined, this) 에서 사용된 함수
      //서브캐 습득시 자리정렬과 스코어 합산
      getSubcha (player: any, target: any):void { 
        target.disableBody(true, true)
        
        let bird = subchas.create(player.x - (30 + subchas.children.entries.length * 80), player.y, 'bird').setScale(0.14)
        subchas.add(bird)
        this.registry.values.score += 100
        this.scoreText.setText(`SCORE ${this.registry.values.score}`)

    }
      
}   // vertical = this.physics.add.staticGroup()
        // vertical.enableBody = true
        // vertical.createMultiple(12, 'ground') 
        // vertical.setAll('checkWorldBounds', true)
        // vertical.setAll('outOfBoundsKill', true)
        // for(var i=0 i<12 i++) {
        //     let newItem = vertical.create(null, 600, 'ground')
        //     newItem.body.immovable = true
        //     newItem.body.velocity.x = -250           
        // }
        
        // tori = this.physics.add.group()
        // tori.enableBody = true
        // tori.physicsBodyType = Phaser.Physics.Arcade

        
        
        // for (var i = 0 i < 50 i++)
        // {
        //     var c = tori.create(this.world.randomX, Math.random() * 500, 'star', this.rnd.integerInRange(0, 36))
        //     c.name = 'veg' + i
        //     c.body.immovable = true
        // }