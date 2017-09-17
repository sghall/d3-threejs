import * as d3 from 'd3'
import './demo.css'
import THREE from './three'
import data from './data.json'

let charts, timer

const scene = new THREE.Scene()

const width = window.innerWidth
const height = window.innerHeight

const camera = new THREE.PerspectiveCamera(40, width / height, 1, 10000)
camera.position.z = 3000

const renderer = new THREE.CSS3DRenderer()
renderer.setSize(width, height)
renderer.domElement.style.position = 'absolute'
document.getElementById('container').appendChild(renderer.domElement)

const controls = new THREE.TrackballControls(camera, renderer.domElement)
controls.addEventListener('change', render)

init()
start()
render()
animate()

function start() {
  setTimeout(() => {
    transform('sphere')
  }, 1000)
}

d3
  .select('#menu')
  .selectAll('button')
  .data(['sphere', 'helix', 'grid'])
  .enter()
  .append('button')
  .html(d => d)
  .on('click', d => transform(d))

function init() {
  const size = [225, 140] // chart [width, height]
  const trbl = [17, 0, 16, 25] // chart margins [top, right, bottom, left]
  const dims = [size[0] - trbl[1] - trbl[3], size[1] - trbl[0] - trbl[2]] // usable dimensions [width, height]

  const legendArr = d3.keys(data[0].recs[0]).filter(key => {
    return key !== 'year'
  })

  const x = d3
    .scaleBand()
    .range([0, dims[0]])
    .domain(
      d3.range(2004, 2014).map(d => {
        return `${d}`
      }),
    )

  const y = d3
    .scaleLinear()
    .range([dims[1], 0])
    .domain([0, 135])

  const xAxis = d3.axisBottom().scale(x)
  const yAxis = d3.axisLeft().scale(y)

  const area = d3
    .area()
    .x(d => x(+d.data.year))
    .y0(d => y(d[0]))
    .y1(d => y(d[1]))
    .curve(d3.curveCatmullRom.alpha(0.5))

  const color = d3
    .scaleOrdinal()
    .range([
      '#F9FFFF',
      '#7FFFFF',
      '#8CAFFF',
      '#3C76FC',
      '#FFD47F',
      '#FFB726',
      '#FFB97F',
      '#FF8926',
    ])

  charts = d3
    .selectAll('.element')
    .data(data)
    .enter()
    .append('div')
    .attr('class', 'element')

  charts
    .append('div')
    .attr('class', 'chartTitle')
    .html(d => {
      return d.name
    })

  charts
    .append('div')
    .attr('class', 'investData')
    .html(d => {
      return d.awards
    })

  charts
    .append('div')
    .attr('class', 'investLabel')
    .html('Investments (10 Yrs)')

  charts
    .append('svg')
    .attr('width', size[0])
    .attr('height', size[1])
    .append('g')
    .attr('class', 'chartg')
    .attr('transform', `translate(${trbl[3]},${trbl[0]})`)

  charts
    .select('.chartg')
    .append('g')
    .attr('class', 'seriesg')
    .selectAll('series')
    .data(d => {
      return prepData(d.recs)
    })
    .enter()
    .append('path')
    .attr('class', 'series')
    .attr('d', d => {
      return area(d)
    })
    .style('fill', d => {
      return color(d.key)
    })

  charts
    .select('.chartg')
    .append('g')
    .attr('class', 'legend')
    .attr('transform', 'translate(0, -15)')
    .selectAll('.legendItem')
    .data(setLegend(legendArr))
    .enter()
    .append('g')
    .attr('class', 'legendItem')
    .each(function() {
      d3
        .select(this)
        .append('rect')
        .attr('x', d => {
          return d.x
        })
        .attr('y', d => {
          return d.y
        })
        .attr('width', 4)
        .attr('height', 4)
        .style('fill', d => {
          return color(d.name)
        })

      d3
        .select(this)
        .append('text')
        .attr('class', 'legendText')
        .attr('x', d => {
          return d.x + 5
        })
        .attr('y', d => {
          return d.y + 4
        })
        .text(d => {
          return d.name
        })
    })

  charts
    .select('.chartg')
    .append('g')
    .attr('class', 'x axis')
    .attr('transform', `translate(0,${dims[1]})`)
    .call(xAxis)

  charts
    .select('.chartg')
    .append('g')
    .attr('class', 'y axis')
    .call(yAxis)
    .append('text')
    .attr('transform', 'rotate(-90)')
    .attr('y', 6)
    .attr('dy', '.71em')
    .style('text-anchor', 'end')
    .text('Investments')

  charts.each(setData)
  charts.each(objectify)

  function prepData(items) {
    const series = d3.keys(items[0]).filter(key => {
      return key !== 'year'
    })

    const stack = d3
      .stack()
      .keys(series)
      .order(d3.stackOrderNone)
      .offset(d3.stackOffsetNone)(items)

    return stack
  }

  function setLegend(arr) {
    return arr.map((n, i) => {
      return { name: n, x: (i % 4) * 48, y: Math.floor(i / 4) * 8 }
    })
  }

  function objectify(d) {
    const object = new THREE.CSS3DObject(this)
    d.object = object

    object.position.x = d.random.position.x
    object.position.y = d.random.position.y
    object.position.z = d.random.position.z

    scene.add(object)
  }

  function setData(d, i) {
    let vector, phi

    const random = new THREE.Object3D()
    random.position.x = Math.random() * 4000 - 2000
    random.position.y = Math.random() * 4000 - 2000
    random.position.z = Math.random() * 4000 - 2000

    d.random = random

    const sphere = new THREE.Object3D()
    vector = new THREE.Vector3()
    phi = Math.acos(-1 + 2 * i / data.length)

    const theta = Math.sqrt((data.length - 1) * Math.PI) * phi

    sphere.position.x = 800 * Math.cos(theta) * Math.sin(phi)
    sphere.position.y = 800 * Math.sin(theta) * Math.sin(phi)
    sphere.position.z = 800 * Math.cos(phi)

    vector.copy(sphere.position).multiplyScalar(2)
    sphere.lookAt(vector)

    d.sphere = sphere

    const helix = new THREE.Object3D()
    vector = new THREE.Vector3()
    phi = (i + 12) * 0.25 + Math.PI

    helix.position.x = 1000 * Math.sin(phi)
    helix.position.y = -(i * 8) + 500
    helix.position.z = 1000 * Math.cos(phi)

    vector.x = helix.position.x * 2
    vector.y = helix.position.y
    vector.z = helix.position.z * 2

    helix.lookAt(vector)

    d.helix = helix

    const grid = new THREE.Object3D()
    grid.position.x = (i % 5) * 400 - 800
    grid.position.y = -(Math.floor(i / 5) % 5) * 400 + 800
    grid.position.z = Math.floor(i / 25) * 1000 - 2000

    d.grid = grid
  }
}

function transform(layout) {
  const duration = 1000

  if (timer) {
    timer.stop()
  }

  const tweens = []

  charts.each(function each(d) {
    const { position, rotation } = d.object
    const ip = d3.interpolateArray(
      position.toArray(),
      d[layout].position.toArray(),
    )
    const ir = d3.interpolateArray(
      rotation.toArray(),
      d[layout].rotation.toArray(),
    )

    tweens.push(function chartTween(t) {
      position.set(...ip(t))
      rotation.set(...ir(t))
    })
  })

  const count = tweens.length

  timer = d3.timer(function tweenCharts(t) {
    const p = Math.min(t / duration, 1)

    for (let i = 0; i < count; i++) {
      tweens[i](p)
    }

    render()

    if (t > duration) {
      timer.stop()
      render()
    }
  })
}

function render() {
  renderer.render(scene, camera)
}

function animate() {
  requestAnimationFrame(animate)
  controls.update()
}
