/* 
Based on Dan Shiffman's video 6.7 p5.js clicking on objects
Code for video https://vimeo.com/channels/learningp5js/141919520
*/
//https://stackoverflow.com/questions/70202216/is-there-a-way-to-check-if-the-mouse-is-clicked-on-a-certain-element-in-p5-js
//https://editor.p5js.org/Kumu-Paul/sketches/kyu5SRqKp
//PiP problem: https://en.wikipedia.org/wiki/Point_in_polygon
//ternary operators: https://developer.mozilla.org/en-US/docs/Learn/JavaScript/Building_blocks/conditionals

var triangles = [];
var sum = 0;


function setup() {
  createCanvas(600, 600);
  background(125);
  for (var i = 0; i < 6; i++) {
    triangles.push(new Triangle(i));
  }
  button = createButton('Überprüfen');
  button.position(300, 50);
  
  
}

function mouseClicked() {
  for (var i = 0; i < triangles.length; i++) {
    triangles[i].clicked(mouseX,mouseY);
  }
}

function draw() {
  sum = 0;
  for (var i = 0; i < triangles.length; i++) {
    triangles[i].display();

    sum = sum + triangles[i].area();
    
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
    
    for (let i = 0,j=2;i<3;j=i++) {
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
      this.col = color(255, 0, 200);
      this.c = !this.c;
    }
    else if (this.count == 1 && this.c) {
      this.col = color(255, 255, 255);
      this.c = !this.c;
    }
  }


  this.area = function() {
    if (this.c) {
    return this.area_t;
    }
    else {
      return 0;
    }
  }

}

function check_answer() {
  background(125);
  textSize(20);

  if (sum == 4){
    stroke(0);
    fill(255, 102, 153);
    text('Richtig', 300, 200);
  }
  else if (sum != 4){
    stroke(0);
    fill(200, 102, 153);
    text('Versuche es nochmals', 300, 200);
  }
  
}