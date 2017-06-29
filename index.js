class App extends React.Component {
  constructor() {
    super();
    this.state = {
      coordinates: [],
      people: [],
    };
    this.mapSettings = {
      mapTypeId: 'terrain',
      zoom: 4,
    };
    this.map = null;
    this.issPath = null;
    this.startPointMarker = null;
    this.fetchData = this.fetchData.bind(this);
  }
  componentDidMount() {
    this.fetchData();
    this.initMap();
    this.intervalID = setInterval(this.fetchData, 5000);
  }
  componentDidUpdate(prevProps, prevState) {
    if (this.state.coordinates.length !== prevState.coordinates.length) {
      this.updateMap();
    }
  }
  componentWillUnmount() {
    clearInterval(this.intervalID);
  }
  fetchData() {
    return fetch('http://api.open-notify.org/iss-now.json')
    .then(res => res.json())
    .then((res) => {
      this.setState(state => ({
        coordinates: [...state.coordinates, {
          lat: parseFloat(res.iss_position.latitude),
          lng: parseFloat(res.iss_position.longitude),
          // timestamp: new Date().toISOString(),
        }],
      }));
      return res.iss_position;
    });
  }
  createMarker(tooltipContent) {
    const marker = new google.maps.Marker({
      map: this.map,
      draggable: false,
    });
    marker.setAnimation(google.maps.Animation.DROP);

    const info = new google.maps.InfoWindow({
      content: tooltipContent,
    });

    marker.addListener('click', () => {
      info.open(this.map, marker);
    });

    return marker;
  }
  initMap() {
    this.map = new google.maps.Map(
      document.getElementById('app'),
      this.mapSettings
    );
    this.startPointMarker = this.createMarker(`
      <div>
        <h3>Starting Position</h3>
        <p>This is the starting position of the <a href="https://en.wikipedia.org/wiki/International_Space_Station" target="_blank">International Space Station</a> as of ${new Date().toLocaleTimeString()}</p>
      </div>`);
    this.endPointMarker = this.createMarker(`
      <div>
        <h3>Current Position</h3>
        <p>This is the current position of the <a href="https://en.wikipedia.org/wiki/International_Space_Station" target="_blank">International Space Station</a></p>
      </div>`);
    this.issPath = new google.maps.Polyline({
      geodesic: true,
      strokeColor: '#ff3333',
      strokeOpacity: 1,
      strokeWeight: 3,
    });

    this.issPath.setMap(this.map);
  }
  updateMap() {
    const center = this.state.coordinates[this.state.coordinates.length - 1];
    this.map.panTo(center);

    this.issPath.setPath(this.state.coordinates);

    if (this.state.coordinates.length === 1) {
      this.startPointMarker.setPosition(this.state.coordinates[0]);
    } else {
      const lastPosition = this.state.coordinates[this.state.coordinates.length - 1];

      this.endPointMarker.setPosition(lastPosition);
    }
  }
  render() {
    return (
      <div className="container">
        <div id="map"></div>
      </div>
    );
  }
}

ReactDOM.render(<App />, document.getElementById('app'));
