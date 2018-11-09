import React, { Component } from 'react';
import './App.css';
import moment from 'moment'
import 'moment-timezone'

const PAGE_SIZE = 3;
class App extends Component {
  constructor() {
    super();
    this.state = { captures: [], info: {}, capturesByDate: {}, displayedCaptureCount: 3, totalCaptureCount: 0 }

    window.onscroll = () => {
      if (window.innerHeight + document.documentElement.scrollTop >= document.documentElement.offsetHeight) {
        if (this.state.displayedCaptureCount <= this.state.totalCaptureCount) {
          this.setState({ displayedCaptureCount: this.state.displayedCaptureCount + PAGE_SIZE });
        }
      }
    };
  }

  componentDidMount() {
    fetch("https://s3-ap-southeast-2.amazonaws.com/shippix/captures.json")
      .then(response => response.json())
      .then(d => {
        const captures = d.captures;

        const capturesByDate = {};
        captures.forEach(capture => {
          const mmsi = capture.substring(0, 9);
          const timestamp = capture.substring(9);
          const captureDate = moment.unix(timestamp);
          const byDate = captureDate.tz('Australia/Sydney').format('YYYY-MM-DD')
          const date = captureDate.tz('Australia/Sydney').format('ll')
          const time = captureDate.tz('Australia/Sydney').format('hh:mm:ss a')
          if (!capturesByDate[byDate]) {
            capturesByDate[byDate] = []
          }
          capturesByDate[byDate].push({
            date, time, mmsi, capture, captureDate
          });
        });
        this.setState({
          captures: captures,
          capturesByDate: capturesByDate,
          info: d.info,
          totalCaptureCount: Object.keys(capturesByDate).length
        })
      })
      .catch(e => { console.error(e) });
  }

  getCapture(mmsi, code, date, time, info) {
    return <div key={code} className="capture">
    <div className="datetime captureLeft" key={date + time}><span className="date">{date}</span> {time}</div>
      <video width="600" height="270" controls>
        <source src={"https://s3-ap-southeast-2.amazonaws.com/shippix/" + code + ".mp4"} type="video/webm" />
      </video>
      <h5>{info ? info.name : ""}</h5>
      <div><span>{info ? info.description : ""}</span></div>
      <div><span>mmsi: {mmsi}{info ? ", size: " + info.size + "" : ""}</span></div>
    </div>
  }

  getCaptureList(capturesByDate, count, info) {
    const captureList = [];
    Object.keys(capturesByDate).sort().reverse().slice(0, count).map(byDate => {
      captureList.push(<div className="dateHeader captureLeft" key={byDate}>{capturesByDate[byDate][0].date}</div>)
      for (let c of capturesByDate[byDate].sort((a,b)=> b.captureDate - a.captureDate)) {
        captureList.push(this.getCapture(c.mmsi, c.capture, c.date, c.time, info[c.mmsi]))
        captureList.push(<div className="clear" key={c.date + c.time + '-clear'}></div>);
      }
    })
    return captureList;
  }
  render() {
    const captureList = this.getCaptureList(this.state.capturesByDate, this.state.displayedCaptureCount, this.state.info);
    return (
      <div className="App">
        {captureList}
      </div>
    );
  }
}

export default App;
