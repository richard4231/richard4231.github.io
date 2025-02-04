/* 
Based on Dan Shiffman's video 6.7 p5.js clicking on objects
Code for video https://vimeo.com/channels/learningp5js/141919520
*/
//https://stackoverflow.com/questions/70202216/is-there-a-way-to-check-if-the-mouse-is-clicked-on-a-certain-element-in-p5-js
//https://editor.p5js.org/Kumu-Paul/sketches/kyu5SRqKp
//PiP problem: https://en.wikipedia.org/wiki/Point_in_polygon
//ternary operators: https://developer.mozilla.org/en-US/docs/Learn/JavaScript/Building_blocks/conditionals

//problem: it is not yet possible, to change the numbers of small squares 
// in a way that it still works fine.

// different sketches in one file with divs in html: 
// http://joemckaystudio.com/multisketches/

// not yet solved: hovering
// https://p5js.org/reference/#/p5/mouseIsPressed
// mouseOver?
// https://nycdoe-cs4all.github.io/units/2/lessons/lesson_2.2

var triangles = [];
var squares = [];
var squares_shift_x = 50;
var squares_shift_y = 300;

var square_edge = 200;

var rows = 8;
var factor = square_edge / rows;

var sum_blue1 = 0;
var sum_green1 = 0;
var sum_yellow1 = 0;

var sum_blue2 = 0;
var sum_green2 = 0;
var sum_yellow2 = 0;

var c_yellow = false;
var c_green = false;
var c_blue = false;
current_r = 255;
current_g = 255;
current_b = 255;
var checker_array = [[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0]];
var checker_array_s = [];
var color_code;

function setup() {
  cnv = createCanvas(600, 600);
  cnv.mouseOver(mousePressedAndHover);
  background(200);
  for (var i = 0; i < 6; i++) {
    triangles.push(new Triangle(i));
  }

  button1 = createButton('Überprüfen');
  button1.position(300, 50);

  button2 = createButton('Überprüfen');
  button2.position(300, 300);
  
  radio1 = createRadio();

  //.option([value], [contentLabel])
  //If 1 param, it's both content AND
  //value. Values treated as strings.
  radio1.option(1, "blue");
  radio1.option(2, "green");
  radio1.option(3, "yellow");

  radio1.selected("1"); //set init value

  for (var i = 0; i < rows; i++) {
    for (var j = 0; j < rows; j++){
    squares.push(new Square(i,j));    
    checker_array_s.push([0,0,0]);
    }
  }

  
}

function mouseClicked() {
  for (var i = 0; i < triangles.length; i++) {
    triangles[i].clicked(mouseX,mouseY);
  }

  for (var i = 0; i < squares.length; i++) {
    squares[i].clicked(mouseX,mouseY,i);
  }
}

function mousePressedAndHover() {
  /*for (var i = 0; i < triangles.length; i++) {
    triangles[i].clicked(mouseX,mouseY);
  }*/

  for (var i = 0; i < squares.length; i++) {
    squares[i].phovered(mouseX,mouseY,i);
  }
}

function draw() {
  switch (radio1.value()) {
    //radio value is always a string
    case "1":
      current_r = 100;
      current_g = 150;
      current_b = 255;
      color_code = 0;
      c_blue = true;
      c_green = false;
      c_yellow = false;
      break;
    case "2":
      current_r = 110;
      current_g = 180;
      current_b = 145;
      color_code = 1;
      c_green = true;
      c_yellow = false;
      c_blue = false;
      break;
    case "3":
      current_r = 250;
      current_g = 250;
      current_b = 110;
      color_code = 2;
      c_yellow = true;
      c_green = false;
      c_blue = false;
      break;
  }
  sum_blue1 = 0;
  sum_green1 = 0;
  sum_yellow1 = 0;
  sum_blue2 = 0;
  sum_green2 = 0;
  sum_yellow2 = 0;

  for (var i = 0; i < triangles.length; i++) {
    triangles[i].display();
    sum_blue1 = sum_blue1 + checker_array[i][0];
    sum_green1 = sum_green1 + checker_array[i][1]; 
    sum_yellow1 = sum_yellow1 + checker_array[i][2];   
    
  }

  for (var i = 0; i < pow(rows,2); i++) {
    squares[i].display();
    sum_blue2 = sum_blue2 + checker_array_s[i][0];
    sum_green2 = sum_green2 + checker_array_s[i][1]; 
    sum_yellow2 = sum_yellow2 + checker_array_s[i][2]; 
  }  

  button1.mousePressed(check_answer1);
  button2.mousePressed(check_answer2);

}

// Triangle class
function Triangle (num) {
  list_triangles = [[[50,250,150],[50,50,150],[2]],[[150,250,250],[150,50,150],[1]],[[150,250,250],[150,150,250],[1]],[[150,50,250],[150,250,250],[2]],[[50,150,50],[150,150,250],[1]],[[50,50,150],[50,150,150],[1]]];
  this.col = color(255,255,255);
  this.c = false;
  this.vert_x = [list_triangles[num][0][0],list_triangles[num][0][1],list_triangles[num][0][2]];
  this.vert_y = [list_triangles[num][1][0],list_triangles[num][1][1],list_triangles[num][1][2]];
  this.area_t = list_triangles[num][2][0];
  this.display = function() {
    stroke(200);
    
    beginShape();
    fill(this.col);
    for (var i = 0; i < 3; i++){
      vertex(this.vert_x[i],this.vert_y[i]);
    }
    endShape(CLOSE);
  }
  
  this.clicked = function(x,y) {
    this.count = 0;
    
    for (let i=0,j=2;i<3;j=i++) {
  
      if ((y > this.vert_y[i]) != (y > this.vert_y[j])) {
        this.slope = (this.vert_y[i]-this.vert_y[j])/(this.vert_x[i]-this.vert_x[j]);
        this.x_slope = this.vert_x[i] + ((y-this.vert_y[i])/this.slope);
        if ((x > this.x_slope)) {
          this.count = this.count + 1;
        }
      }
    }
    
    if (this.count == 1 && !this.c) {
      this.col = color(current_r,current_g,current_b);
      this.c = !this.c;
      checker_array[num][color_code] = this.area_t;
    }
    else if (this.count == 1 && this.c) {
      this.col = color(255, 255, 255);
      this.c = !this.c;
      checker_array[num] = [0,0,0];
    }
  }

}

// Square class
function Square (row, colmn) {

    this.col = color(255, 255, 255);
    this.c = false;
    this.area_s = 1;

    this.display = function () {
      stroke(200);

      beginShape();
      fill(this.col);
      this.vert_x1 = squares_shift_x + colmn * factor;
      this.vert_x2 = squares_shift_x + (colmn + 1) * factor;
      this.vert_y1 = squares_shift_y + row * factor;
      this.vert_y2 = squares_shift_y + (row + 1) * factor;

      vertex(this.vert_x1, this.vert_y1);
      vertex(this.vert_x2, this.vert_y1);
      vertex(this.vert_x2, this.vert_y2);
      vertex(this.vert_x1, this.vert_y2);
      endShape(CLOSE);

    };

    //check if clicked position is within square 
    this.clicked = function (x, y, num_s) {
      
      if ((x > this.vert_x1) && (x < this.vert_x2) && (y >= this.vert_y1) && (y <= this.vert_y2)) {

      if (!this.c) {
        this.col = color(current_r, current_g, current_b);
        this.c = !this.c;
        checker_array_s[num_s][color_code] = this.area_s;
      }
      else if (this.c) {
        this.col = color(255, 255, 255);
        this.c = !this.c;
        checker_array_s[num_s] = [0,0,0];
      }
    }
  }

  this.phovered = function (x, y, num_s) {
      
    if ((x > this.vert_x1) && (x < this.vert_x2) && (y >= this.vert_y1) && (y <= this.vert_y2)) {

    if (!this.c) {
      this.col = color(current_r, current_g, current_b);
      this.c = !this.c;
      checker_array_s[num_s][color_code] = this.area_s;
    }
    else if (this.c) {
      this.col = color(255, 255, 255);
      this.c = !this.c;
      checker_array_s[num_s] = [0,0,0];
    }
  }
}
}


function check_answer1() {
  background(200);
  textSize(20);

  if (sum_blue1 == 4 && sum_green1 == 2 && sum_yellow1 == 1){
    noStroke;
    fill(255, 102, 153);
    text('Richtig', 300, 200);
  }
  else {
    noStroke;
    fill(20, 20, 20);
    text('Versuche es', 300, 200);
    text('nochmals', 300, 230);
  }
  
}

function check_answer2() {
  background(200);
  textSize(20);

  if (sum_blue2/pow(rows,2) == 0.5 && sum_green2/pow(rows,2) == 0.25 && sum_yellow2/pow(rows,2) == 0.125){
    noStroke;
    fill(255, 102, 153);
    text('Richtig', 300, 400);
  }
  else {
    noStroke;
    fill(20, 20, 20);
    text('Versuche es', 300, 400);
    text('nochmals', 300, 430);
    print(checker_array_s);
  }
  
}