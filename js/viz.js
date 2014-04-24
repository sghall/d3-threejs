(function(){
  var VIZ ={};
  var camera, renderer, controls, scene = new THREE.Scene();
  var width = window.innerWidth, height = window.innerHeight;

  camera = new THREE.PerspectiveCamera(40, width/height , 1, 10000);
  camera.position.z = 3000;
  camera.setLens(30);
  
  VIZ.drawElements = function (data) {

    VIZ.count = data.length;

    var margin = {top: 17, right: 0, bottom: 16, left: 20},
        width  = 225 - margin.left - margin.right,
        height = 140 - margin.top  - margin.bottom;

    var legendArr = d3.keys(data[0].recs[0])
        .filter(function (key) { return key !== 'year';});

    var x = d3.scale.ordinal()
        .rangeRoundBands([0, width], 0, 0)
        .domain(d3.range(2004,2014).map(function (d) { return d + ""; }))

    var y = d3.scale.linear().range([height, 0]).domain([0, 135]);

    var xAxis = d3.svg.axis().scale(x).orient("bottom");
    var yAxis = d3.svg.axis().scale(y).orient("left");

    var area = d3.svg.area()
        .interpolate("cardinal")
        .x(function (d) { return x(d.label) + x.rangeBand() / 2; })
        .y0(function (d) { return y(d.y0); })
        .y1(function (d) { return y(d.y0 + d.y); });

    var color = d3.scale.ordinal()
        .range(['rgb(166,206,227)','rgb(31,120,180)','rgb(178,223,138)','rgb(51,160,44)','rgb(251,154,153)','rgb(227,26,28)','rgb(253,191,111)','rgb(255,127,0)']);

    var elements = d3.selectAll('.element')
        .data(data).enter()
        .append('div')
        .attr('class', 'element')

    elements.append('div')
      .attr('class', 'chartTitle')
      .html(function (d) { return d.name; })

    elements.append('div')
      .attr('class', 'investData')
      .html(function (d, i) { return d.awards; })

    elements.append('div')
      .attr('class', 'investLabel')
      .html("Investments (10 Yrs)")

    elements.append("svg")
      .attr("width",  width  + margin.left + margin.right)
      .attr("height", height + margin.top  + margin.bottom)
    .append("g")
      .attr("class", "chartg")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    elements.select(".chartg")
      .append("g").attr("class", "seriesg") 
      .selectAll("series")
      .data(function (d) { return prepData(d.recs); })
      .enter()
        .append("path")
        .attr("class", "series")
        .attr("d", function (d) { return area(d.values); })
        .style("fill", function (d) { return color(d.name); })

    elements.select(".chartg")
      .append("g")
      .attr("class", "legend")
      .attr("transform", "translate(15, -15)")
      .selectAll(".legendItem")
      .data(setLegend(legendArr))
      .enter()
        .append("g")
        .attr("class", "legendItem")
        .each(function (d) {
          d3.select(this).append("rect")
            .attr("x", function (d) { return d.x })
            .attr("y", function (d) { return d.y })
            .attr("width", 4)
            .attr("height",4)
            .style("fill", function (d) { return color(d.name); })

          d3.select(this).append("text")
            .attr("class", "legendText")
            .attr("x", function (d) { return d.x + 5 })
            .attr("y", function (d) { return d.y + 4 })
            .text(function (d) { return d.name; });
       });

    elements.select(".chartg").append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis);

    elements.select(".chartg").append("g")
      .attr("class", "y axis")
      .call(yAxis)
    .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("dy", ".71em")
      .style("text-anchor", "end")
      .text("Investments");

    elements.each(setData);
    elements.each(objectify);

    function prepData (data) {
      var stack = d3.layout.stack()
          .offset("zero")
          .values(function (d) { return d.values; })
          .x(function (d) { return x(d.label) + x.rangeBand() / 2; })
          .y(function (d) { return d.value; });

      var labelVar = 'year';
      var varNames = d3.keys(data[0])
          .filter(function (key) { return key !== labelVar;});

      var seriesArr = [], series = {};
      varNames.forEach(function (name) {
        series[name] = {name: name, values:[]};
        seriesArr.push(series[name]);
      });

      data.forEach(function (d) {
        varNames.map(function (name) {
          series[name].values.push({
            name: name, 
            label: d[labelVar], 
            value: +d[name]
          });
        });
      });
      return stack(seriesArr);
    }
  }

  function setLegend(arr) {
    return arr.map(function (n, i) {
      return {name: n, x: (i % 4) * 48, y: Math.floor(i / 4) * 8};
    });
  }

  function objectify(d) {
    var object = new THREE.CSS3DObject(this);
    object.position = d.random.position;
    scene.add(object);
  }

  function setData(d, i) {
    var vector, phi, theta;

    var random = new THREE.Object3D();
    random.position.x = Math.random() * 4000 - 2000;
    random.position.y = Math.random() * 4000 - 2000;
    random.position.z = Math.random() * 4000 - 2000;
    d['random'] = random;

    var sphere = new THREE.Object3D();
    vector = new THREE.Vector3();
    phi = Math.acos(-1 + ( 2 * i ) / (VIZ.count - 1));
    theta = Math.sqrt((VIZ.count - 1) * Math.PI) * phi;
    sphere.position.x = 800 * Math.cos(theta) * Math.sin(phi);
    sphere.position.y = 800 * Math.sin(theta) * Math.sin(phi);
    sphere.position.z = 800 * Math.cos(phi);
    vector.copy(sphere.position).multiplyScalar(2);
    sphere.lookAt(vector);
    d['sphere'] = sphere;

    var helix = new THREE.Object3D();
    vector = new THREE.Vector3();
    phi = (i + 12) * 0.250 + Math.PI;
    helix.position.x = 1000 * Math.sin(phi);
    helix.position.y = - (i * 8) + 500;
    helix.position.z = 1000 * Math.cos(phi);
    vector.x = helix.position.x * 2;
    vector.y = helix.position.y;
    vector.z = helix.position.z * 2;
    helix.lookAt(vector);
    d['helix'] = helix;

    var grid = new THREE.Object3D();
    grid.position.x = (( i % 5 ) * 400) - 800;
    grid.position.y = ( - ( Math.floor( i / 5 ) % 5 ) * 400 ) + 800;
    grid.position.z = (Math.floor( i / 25 )) * 1000 - 2000;
    d['grid'] = grid;
  }

  VIZ.render = function () {
    renderer.render(scene, camera);
  }

  d3.select("#menu").selectAll('button')
    .data(['sphere', 'helix', 'grid']).enter()
      .append('button')
      .html(function (d) { return d; })
      .on('click', function (d) { VIZ.transform(d); })

  VIZ.transform = function (layout) {
    var duration = 1000;

    TWEEN.removeAll();

    scene.children.forEach(function (object){
      var newPos = object.element.__data__[layout].position;
      var coords = new TWEEN.Tween(object.position)
            .to({x: newPos.x, y: newPos.y, z: newPos.z}, duration)
            .easing(TWEEN.Easing.Sinusoidal.InOut)
            .start();

      var newRot = object.element.__data__[layout].rotation;
      var rotate = new TWEEN.Tween(object.rotation)
            .to({x: newRot.x, y: newRot.y, z: newRot.z}, duration)
            .easing(TWEEN.Easing.Sinusoidal.InOut)
            .start();
    });
    
   var update = new TWEEN.Tween(this)
       .to({}, duration)
       .onUpdate(VIZ.render)
       .start();
  }

  VIZ.animate = function () {
    requestAnimationFrame(VIZ.animate);
    TWEEN.update();
    controls.update();
  }

  renderer = new THREE.CSS3DRenderer();
  renderer.setSize(width, height);
  renderer.domElement.style.position = 'absolute';
  document.getElementById('container').appendChild(renderer.domElement);

  controls = new THREE.TrackballControls(camera, renderer.domElement);
  controls.rotateSpeed = 0.5;
  controls.minDistance = 100;
  controls.maxDistance = 6000;
  controls.addEventListener('change', VIZ.render);

  VIZ.onWindowResize = function () {
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    VIZ.render();
  }
  window.VIZ = VIZ;
}())