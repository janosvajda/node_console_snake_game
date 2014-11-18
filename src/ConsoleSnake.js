var keypress = require('keypress')
  , tty = require('tty')
  , readline = require('readline')
  ;


/**
 * Game class
 * @param {object} game_console
 * @returns {Snake}
 */
function Snake(game_console)
{
    var self=this;
    var snake_body_array;
    var snake_direction;
    var food;
    var score = 0;
    var default_snake_length=3;
    
    var MOVE_UP = 1;
    var MOVE_DOWN = 2;
    var MOVE_RIGHT = 3;
    var MOVE_LEFT = 4;
    
    
    var get_max_column=function(){
        return process.stdout.columns;
    }

    var get_max_rows=function(){
        return process.stdout.rows;
    }

    var create_snake = function()
    {
        var length = default_snake_length;
        snake_body_array = [];
        for(var i = length-1; i>=0; i--)
        {
            snake_body_array.push({x: i, y:0});
        }
    };

    var create_food =function()
    {
        food = {
                col: Math.floor((Math.random() * get_max_column()) + 1), 
                row: Math.floor((Math.random() * get_max_rows()) + 1)
        };
    }

    var drawSnake =function()
    {
        remove_cell();
        var move_col = snake_body_array[0].x;
        var move_row = snake_body_array[0].y;

        switch(snake_direction){
            case MOVE_UP:    move_row--; break;
            case MOVE_DOWN:  move_row++;break;
            case MOVE_LEFT:  move_col--;break;
            case MOVE_RIGHT: move_col++;break;
        }
        
        if(move_col == -1 || 
           move_col == get_max_column() || 
           move_row == -1 || 
           move_row == get_max_rows() || 
           is_crash(move_col, move_row))
        {
            game_console.clear_screen();
            self.init();
            return 0;
        }
        if(move_col == food.col && move_row == food.row)
        {
            var tail = {x: move_col, y: move_row};
            score++;
            draw_score();
            create_food();
        }else
        {
            var tail = snake_body_array.pop();
            tail.x = move_col; tail.y = move_row;
        }
        snake_body_array.unshift(tail);
        for(var i = 0; i < snake_body_array.length; i++)
        {
                var c = snake_body_array[i];
                paint_snake_body(c.x, c.y);
        }
        draw_food(food.col, food.row);
    }

    var remove_cell =function()
    {
        var last_item=snake_body_array[snake_body_array.length - 1];
        var lx =last_item.x;
        var ly=last_item.y;
        process.stdout.cursorTo(lx, ly-1);
        process.stdout.write(' ');
        process.stdout.cursorTo(lx, ly+1);
        process.stdout.write(' ');
        process.stdout.cursorTo(lx-1, ly);
        process.stdout.write(' ');
        process.stdout.cursorTo(lx+1, ly);
        process.stdout.write(' ');
    }

    var draw_food =function(x,y)
    {
         process.stdout.cursorTo(x, y);
         process.stdout.write('X');
    }

    var paint_snake_body =function(x,y)
    {
        process.stdout.cursorTo(x, y);
        process.stdout.write('O');
    }

    var draw_score =function()
    {
        process.stdout.cursorTo(0, 0);
        process.stdout.write('Score:' + score);
    }

    var is_crash =function(x, y)
    {
        for(var i = 0; i < snake_body_array.length; i++)
        {
            if(snake_body_array[i].x == x && snake_body_array[i].y == y){
                return true;
            }
        }
        return false;
    }

    var gameTimer = function(){
        if(typeof game_timer != 'undefined') clearInterval(game_timer);
        game_timer = setInterval(drawSnake, 80);
    }

    this.setSnakeDirectionUp = function(direction){
        snake_direction=MOVE_UP;
    }
    this.setSnakeDirectionDown = function(direction){
        snake_direction=MOVE_DOWN;
    }
    this.setSnakeDirectionRight = function(direction){
        snake_direction=MOVE_RIGHT;
    }
    this.setSnakeDirectionLeft = function(direction){
        snake_direction=MOVE_LEFT;
    }

    /**
     * Init game class
     */
    this.init = function()
    {
        snake_direction = MOVE_RIGHT;
        create_snake();
        create_food();
        gameTimer();
    }
    
}

/**
 * Simple console class
 * @returns
 */
function GameConsole(){
    var console_process = process;
    
    this.clear_screen = function(){
        var lines = console_process.stdout.getWindowSize()[1];
            process.stdout.write('\u001B[2J\u001B[0;0f');
    }
    

    this.manage_console_keyboard_events =  function(){
        keypress(console_process.stdin);
        console_process.stdin.on('keypress', function (ch, key) {
            if (key && key.name == 'up') {
                game.setSnakeDirectionUp();
            }
            if (key && key.name == 'down') {
                game.setSnakeDirectionDown();
            }
            if (key && key.name == 'right') {
                game.setSnakeDirectionRight();
            }
            if (key && key.name == 'left') {
                game.setSnakeDirectionLeft();
            }
            if (key && key.ctrl && key.name == 'c') {
              console_process.stdin.pause();
              console_process.exit(1);
            }
        });

        if (typeof process.stdin.setRawMode == 'function') {
          console_process.stdin.setRawMode(true);
        } else {
          tty.setRawMode(true);
        }
    }
    
    this.resume =  function(){
        process.stdin.resume();
    }

}

/**
 * Start game
 */
var game_console = new GameConsole();
var game = new Snake(game_console);
game_console.clear_screen();
game_console.manage_console_keyboard_events();
game.init();
game_console.resume();