/* 
Based on Dan Shiffman's video 6.7 p5.js clicking on objects
Code for video https://vimeo.com/channels/learningp5js/141919520
*/
//https://stackoverflow.com/questions/70202216/is-there-a-way-to-check-if-the-mouse-is-clicked-on-a-certain-element-in-p5-js
//https://editor.p5js.org/Kumu-Paul/sketches/kyu5SRqKp
//PiP problem: https://en.wikipedia.org/wiki/Point_in_polygon
//ternary operators: https://developer.mozilla.org/en-US/docs/Learn/JavaScript/Building_blocks/conditionals

var triangles = [];
var sum_blue = 0;
var sum_green = 0;
var sum_yellow = 0;
var c_yellow = false;
var c_green = false;
var c_blue = false;
current_r = 255;
current_g = 255;
current_b = 255;
var checker_array = [[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0]];
var color_code;

function setup() {
  createCanvas(600, 300);
  background(200);
  for (var i = 0; i < 6; i++) {
    triangles.push(new Triangle(i));
  }
  button = createButton('Überprüfen');
  button.position(300, 50);
  
  radio1 = createRadio();

  //.option([value], [contentLabel])
  //If 1 param, it's both content AND
  //value. Values treated as strings.
  radio1.option(1, "blue");
  radio1.option(2, "green");
  radio1.option(3, "yellow");

  radio1.value("1"); //set init value
  
  
}

function mouseClicked() {
  for (var i = 0; i < triangles.length; i++) {
    triangles[i].clicked(mouseX,mouseY);
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
      current_r = 100;
      current_g = 240;
      current_b = 100;
      color_code = 1;
      c_green = true;
      c_yellow = false;
      c_blue = false;
      break;
    case "3":
      current_r = 255;
      current_g = 255;
      current_b = 100;
      color_code = 2;
      c_yellow = true;
      c_green = false;
      c_blue = false;
      break;
  }
  sum_blue = 0;
  sum_green = 0;
  sum_yellow = 0;

  for (var i = 0; i < triangles.length; i++) {
    triangles[i].display();
    sum_blue = sum_blue + checker_array[i][0];
    sum_green = sum_green + checker_array[i][1]; 
    sum_yellow = sum_yellow + checker_array[i][2];   
    
  }

  button.mousePressed(check_answer);

}

/////
function Triangle(num) {
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
      //j = (i + 1) % 3;
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

function check_answer() {
  background(200);
  textSize(20);

  if (sum_blue == 4 && sum_green == 2 && sum_yellow == 1){
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