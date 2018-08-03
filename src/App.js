import React, { Component } from 'react';
import './App.css';
import moment from 'moment'
import 'moment-timezone'

class App extends Component {
  constructor() {
    super();
    this.state = { captures: [], info: {} }
  }
  componentDidMount() {
    fetch("https://s3-ap-southeast-2.amazonaws.com/shippix/captures.json")
      .then(response => response.json())
      .then(d => {
        this.setState({
          captures: d.captures,
          info: d.info
        })
      })
      .catch(e => { console.error(e) });
  }
  getCapture(mmsi, code, time, info) {
    return <div  key={code} className="capture">
        <video width="600" height="270" controls>
          <source src={"https://s3-ap-southeast-2.amazonaws.com/shippix/"+code+".mp4"} type="video/webm" />
        </video>        
        <h5>{info? info.name : ""}</h5>
        <div><strong>{info? info.description : ""}</strong></div>
        <div><em>MMSI: {mmsi} {info? "(size: "+info.size+")" : ""}</em></div>
      </div>
  }
  getCaptureList(captures, info) {
    const capturesByDate = {};
    captures.forEach(capture => {
      const mmsi = capture.substring(0, 9);
      const timestamp = capture.substring(9);
      const captureDate = moment.unix(timestamp)
      const date = captureDate.tz('Australia/Sydney').format('ll ')
      const time = captureDate.tz('Australia/Sydney').format('hh:mm:ss a')
      if (!capturesByDate[timestamp]) {
        capturesByDate[timestamp] = []
      }
      capturesByDate[timestamp].push({
        date, time, mmsi, capture
      });
    });
    const captureList = [];
    Object.keys(capturesByDate).sort().reverse().map(timestamp => {
      captureList.push(<div className="date captureLeft" key={timestamp}>{capturesByDate[timestamp][0].date}</div>)
      for (let c of capturesByDate[timestamp].reverse()) {
        captureList.push(<div className="time captureLeft" key={c.date+c.time}>{c.time}</div>)
        captureList.push(this.getCapture(c.mmsi, c.capture, c.time, info[c.mmsi]))
        captureList.push(<div className="clear" key={timestamp+'-clear'}></div>);
      }
    })
    return captureList;
  }
  render() {
    const captureList = this.getCaptureList(this.state.captures, this.state.info);
    return (
      <div className="App">
        {captureList}
      </div>
    );
  }
}

export default App;
