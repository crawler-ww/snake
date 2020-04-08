/**
 * 首先分析，要把整个面板看成时一个一个的小方块，相当于表格 30*30
 */
const sw = 20,  //一个方块的宽度
      sh = 20,  //一个方块的高度
      tr = 30,  //行数
      td = 30;  //列数
let snake = null,  //蛇的实例
    food = null,    //食物的实例
    game = null;  //游戏的实例
let time = 200; //蛇移动的速度
//方块的类
class Square{
    /**
     * 构造函数，x，y是坐标，例如0,0 1,0 2,0 4,5
     */
    constructor(x, y, classname){
        this.x = x * sw;
        this.y = y * sh;
        this.class = classname;

        //每一个小方块对应的DOM元素
        this.viewContent = document.createElement("div");
        this.viewContent.className = this.class;
        //指定方块的父级元素
        this.parent = document.getElementById("snakeWrap");
    };
    //创建方块DOM，并添加样式
    create(){
        this.viewContent.style.position = "absolute";
        this.viewContent.style.width = sw + "px";
        this.viewContent.style.height = sh + "px";
        this.viewContent.style.left = this.x + "px";
        this.viewContent.style.top = this.y + "px";

        //向页面中插入DOM元素
        this.parent.appendChild(this.viewContent);
    };
    //删除DOm元素
    remove(){
        this.parent.removeChild(this.viewContent);
    }
};

//创建一个蛇的类
class Snake{
    constructor(){
        this.head = null;   //蛇头的信息
        this.tail = null;    //蛇尾的信息
        this.pos = [];     //蛇身上每一个方块的位置

        this.directionNum = {
            //蛇走的方向，用一个对象来表示
            left:{
                x: -1,
                y: 0,
                rotate: 180
            },
            right:{
                x: 1,
                y: 0,
                rotate: 0
            },
            up:{
                x: 0,
                y: -1,
                rotate: -90
            },
            down:{
                x: 0,
                y: 1,
                rotate: 90
            }
        }
    };
    //初始化
    init(){
        //创建一个蛇头
        let snakeHead = new Square(2, 0, "snakeHead");
        snakeHead.create();

        //存储蛇头
        this.head = snakeHead;
        this.pos.push([2, 0]);

        //创建蛇的身体1
        let snakeBody1 = new Square(1, 0, "snakeBody");
        snakeBody1.create();
        this.pos.push([1, 0]);

        //创建蛇的身体2
        let snakeBody2 = new Square(0, 0, "snakeBody");
        snakeBody2.create();
        this.tail = snakeBody2;
        this.pos.push([0, 0]);
        
        //形成链表关系
        snakeHead.last = null;
        snakeHead.next = snakeBody1;

        snakeBody1.last = snakeHead;
        snakeBody1.next = snakeBody2;

        snakeBody2.last = snakeBody1;
        snakeBody2.next = null;

        //给蛇添加一条属性，控制蛇走的方向
        this.direction = this.directionNum.right;
    };

    //用来获取蛇头的下一个位置对应的元素，要根据元素做不同的事情
    getNextPos(){
        let nextPos = [
            this.head.x / sw + this.direction.x,
            this.head.y / sh + this.direction.y
        ];
        
        //下一个点是自己，代表撞到了自己，游戏结束
        //于每个方块的坐标进行对比，如果下一个点，和某一个方块一样，就判定为撞到了自己
        let selfCollied = false;
        let [nextPosX, nextPosy] = nextPos;
        this.pos.forEach(value=>{
            let [PosX, PosY] = value;
            if(nextPosX === PosX && nextPosy === PosY){
                selfCollied = true;
                // return;
            }
        });
        if(selfCollied){
            this.startegies.die();
            return;
        }
        //撞到墙了
        if(nextPosX < 0 || nextPosy < 0 || nextPosX > tr - 1 || nextPosy > td - 1){
            this.startegies.die();
            return;
        }
        //下一个点是苹果
        if(food && nextPosX == food.pos[0] && nextPosy == food.pos[1]){
            this.startegies.eat.call(this);
            return;
        }
        //继续走
        this.startegies.move.call(this);
    }

    //用于处理事件的函数
    startegies = {
        move(format){
            //掐头去尾，把把蛇头删掉，创建一个蛇头到下一个位置，再创建一个身体，插入到旧的蛇头的位置，再把尾巴删掉
            //创建蛇的身体
            let newbody = new Square(this.head.x / sw, this.head.y / sh, "snakeBody");
            newbody.create();
            //更新链表的关系
            newbody.next = this.head.next;
            newbody.next.last = newbody;
            //创建蛇头
            let newhead = new Square(this.head.x / sw + this.direction.x, this.head.y / sh + this.direction.y, "snakeHead");
            newhead.viewContent.style.transform = `rotate(${this.direction.rotate}deg)`;
            newhead.create();
            this.head.remove();
            //更新链表的关系
            newhead.next = newbody;
            newhead.last = null;
            newbody.last = newhead;
            //更新每一个方块的坐标
            this.pos.splice(0, 0, [this.head.x / sw + this.direction.x, this.head.y / sh + this.direction.y]);
            this.head = newhead;

            if(!format){
                this.tail.remove();
                //更新链表
                this.tail = this.tail.last;
                //删除pos中的最后一个元素，对应蛇的尾巴
                this.pos.pop();
            }
        },
        eat(){
            this.startegies.move.call(this, true);
            createFood();
            game.score++;
        },
        die(){
            game.over();
        }
    }
};
snake = new Snake();


//创建食物
function createFood(){
    let x = null;
    let y = null;

    //循环跳出的条件，true表示事物的坐标在食物身上（继续循环）
    let include = true;
    while(include){
        x = Math.round(Math.random() * (td - 1));
        y = Math.round(Math.random() * (tr - 1));

        snake.pos.forEach(value=>{
            if(x != value[0] && y != value[1]){
                include = false;
            }
        });
    };
    //生成食物
    food = new Square(x, y, "food");
    food.pos = [x, y];
    let foodDOM = document.querySelector(".food");
    if(foodDOM){
        foodDOM.style.left = x * sw + "px";
        foodDOM.style.top = y * sh + "px";
    }else{
        food.create();
    }
}

//提供游戏逻辑
class Game{
    constructor(){
        this.timer = null;
        this.score = 0;
    };
    //初始化游戏
    init(){
        snake.init();
        // snake.getNextPos();
        createFood();

        //添加键盘监听事件
        document.addEventListener("keydown", ev => {
            if(ev.which == 37 && snake.direction != snake.directionNum.right){
                snake.direction = snake.directionNum.left;
            }else if(ev.which == 38 && snake.direction != snake.directionNum.down){
                snake.direction = snake.directionNum.up;
            }else if(ev.which == 39 && snake.direction != snake.directionNum.left){
                snake.direction = snake.directionNum.right;
            }else if(ev.which == 40 && snake.direction != snake.directionNum.up){
                snake.direction = snake.directionNum.down;
            }
        });
    };

    //开始游戏
    start(){
        this.timer = setInterval(() => {
            snake.getNextPos();
        }, time);
    };
    //暂停游戏
    pause(){
        this.timer = clearInterval(this.timer);
    }
    //结束游戏
    over(){
        this.timer = clearInterval(this.timer);
        alert("游戏结束，您的得分为："+this.score+"分");
        //还要初始化界面，和对象
        snake = new Snake();
        game = new Game();
        document.getElementById("snakeWrap").innerHTML = "";
        document.querySelector(".startbtn").style.display = "block";
    }
};

game = new Game();
//点击开始游戏按钮
document.querySelector(".startbtn").addEventListener("click", function(){
    this.style.display = "none";
    game.init();
    game.start();
});
//点击面板暂停游戏
document.getElementById("snakeWrap").addEventListener("click", () => {
    game.pause();
    document.querySelector(".pauseBtn").style.display = "block";
});

//点击暂停按钮，继续游戏
document.querySelector(".pauseBtn").addEventListener("click", function(){
    this.style.display = "none";
    game.start();
});